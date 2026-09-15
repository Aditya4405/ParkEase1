package com.demo.parkease.service;

import com.demo.parkease.dto.*;
import com.demo.parkease.entity.Role;
import com.demo.parkease.entity.User;
import com.demo.parkease.repository.UserRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Handles AI chatbot interactions by:
 *  1. Building a conversation with system prompt + user messages
 *  2. Sending it to the Groq API (Llama 3.1 8B)
 *  3. Parsing the response for either a plain reply or an ACTION block
 *  4. Executing the action against existing ParkEase services
 *  5. Returning the final ChatResponse to the controller
 */
@Service
public class ChatbotService {

    @Value("${groq.api.key}")
    private String groqApiKey;

    @Value("${groq.model:llama-3.1-8b-instant}")
    private String groqModel;

    private static final String GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

    private final ObjectMapper       objectMapper;
    private final RestTemplate       restTemplate;
    private final UserRepository     userRepository;
    private final UserParkingService userParkingService;
    private final BookingService     bookingService;
    private final DashboardService   dashboardService;
    private final UserDashboardService userDashboardService;
    private final ParkingService     parkingService;

    public ChatbotService(UserRepository userRepository,
                          UserParkingService userParkingService,
                          BookingService bookingService,
                          DashboardService dashboardService,
                          UserDashboardService userDashboardService,
                          ParkingService parkingService) {
        this.objectMapper       = new ObjectMapper();
        this.restTemplate       = new RestTemplate();
        this.userRepository     = userRepository;
        this.userParkingService = userParkingService;
        this.bookingService     = bookingService;
        this.dashboardService   = dashboardService;
        this.userDashboardService = userDashboardService;
        this.parkingService     = parkingService;
    }

    // ─── PUBLIC ENTRY POINT ──────────────────────────────────────────────────

    /**
     * Process a user message.
     *
     * @param message           the user's natural-language message
     * @param userId            the logged-in user's ID
     * @param conversationHistory  list of previous {role, content} maps kept by the controller
     * @return ChatResponse with reply text + optional action + data
     */
    public ChatResponse processMessage(String message,
                                       Long userId,
                                       List<Map<String, String>> conversationHistory) {
        try {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            String systemPrompt = buildSystemPrompt(user);

            // ── Build the messages array ─────────────────────────────────────
            ArrayNode messages = objectMapper.createArrayNode();

            // System prompt
            ObjectNode sysMsg = objectMapper.createObjectNode();
            sysMsg.put("role", "system");
            sysMsg.put("content", systemPrompt);
            messages.add(sysMsg);

            // Conversation history (for context awareness)
            if (conversationHistory != null) {
                for (Map<String, String> entry : conversationHistory) {
                    ObjectNode histMsg = objectMapper.createObjectNode();
                    histMsg.put("role", entry.get("role"));
                    histMsg.put("content", entry.get("content"));
                    messages.add(histMsg);
                }
            }

            // Current user message
            ObjectNode userMsg = objectMapper.createObjectNode();
            userMsg.put("role", "user");
            userMsg.put("content", message);
            messages.add(userMsg);

            // ── Call Groq API ────────────────────────────────────────────────
            String aiContent = callGroqApi(messages);

            // ── Parse potential ACTION block ─────────────────────────────────
            return parseAndExecute(aiContent, user);

        } catch (Exception e) {
            return ChatResponse.builder()
                    .reply("Sorry, I encountered an error: " + e.getMessage())
                    .build();
        }
    }

    // ─── SYSTEM PROMPTS ──────────────────────────────────────────────────────

    private String buildSystemPrompt(User user) {

        String base = """
            You are ParkEase Assistant, a smart AI parking assistant.
            You help users interact with the ParkEase parking management platform.
            Always respond in a friendly, concise, and helpful manner.
            The current user is: %s (ID: %d, Role: %s).

            CRITICAL INSTRUCTIONS:
            1. If the user asks for data (like "show my spaces", "find parking", "show bookings"), YOU MUST NEVER MAKE UP OR HALLUCINATE DATA.
            2. Instead of hallucinating data, you MUST respond with ONLY a JSON block wrapped in ```action tags so the backend can fetch the real data.
            3. For normal conversational questions (greetings, general help), respond with plain text — NO JSON.
            4. NEVER mix JSON and plain text in the same response.
            5. Always confirm before performing destructive actions (cancel booking).
            """.formatted(user.getName(), user.getId(), user.getRole().name());

        if (user.getRole() == Role.USER) {
            return base + """

                USER-SPECIFIC ACTIONS (respond with ```action JSON block):

                Book a slot:
                - If the user says "Book a slot", you MUST ask them: "Which parking do you want to book at?"
                - If they provide a parking name but no slot, you MUST ask: "Which slot would you like? (e.g., CAR-03)"
                - Once you have BOTH the `parkingName` and `slotCode`, output:
                ```action
                {"action": "initiate_booking", "parkingName": "<parking name>", "slotCode": "<slot code>"}
                ```

                Search parking by location:
                ```action
                {"action": "search_parking", "location": "<location name>"}
                ```

                View all available parkings:
                ```action
                {"action": "list_parkings"}
                ```

                Get my bookings:
                ```action
                {"action": "my_bookings"}
                ```

                Get my active booking:
                ```action
                {"action": "active_booking"}
                ```

                Cancel my booking (only after user confirms):
                ```action
                {"action": "cancel_booking", "bookingId": <id>}
                ```

                Get my dashboard stats:
                ```action
                {"action": "user_stats"}
                ```

                If the user asks about pricing, availability, or nearby parking,
                use "search_parking" with the location they mention.
                If no location is provided, use "list_parkings" to show all options.
                """;

        } else if (user.getRole() == Role.OWNER) {
            return base + """

                OWNER-SPECIFIC ACTIONS (respond with ```action JSON block):

                Add a new parking space:
                - If the owner says "Add parking", you MUST ask for: name, location, number of car, bike, large, and small slots.
                - Ask them conversationally one by one if missing. DO NOT make up counts.
                - Once you have all 6 parameters, output:
                ```action
                {"action": "create_parking", "name": "<name>", "location": "<location>", "carCount": <num>, "bikeCount": <num>, "largeCount": <num>, "smallCount": <num>}
                ```

                View my parkings:
                ```action
                {"action": "owner_parkings"}
                ```

                View bookings for my parking spaces:
                ```action
                {"action": "owner_bookings"}
                ```

                View my dashboard/earnings stats:
                ```action
                {"action": "owner_stats"}
                ```

                If the user asks about revenue/earnings, use "owner_stats".
                If they ask about bookings on their spaces, use "owner_bookings".
                """;
        }

        return base + "You are an admin. Provide helpful information about the ParkEase system.";
    }

    // ─── GROQ API CALL ───────────────────────────────────────────────────────

    private String callGroqApi(ArrayNode messages) throws Exception {
        String[] candidateModels = new String[]{
            groqModel,
            "llama-3.1-8b-instant",
            "gemma2-9b-it"
        };

        Exception lastException = null;

        for (String modelName : candidateModels) {
            if (modelName == null || modelName.isBlank()) continue;

            try {
                ObjectNode requestBody = objectMapper.createObjectNode();
                requestBody.put("model", modelName);
                requestBody.set("messages", messages);
                requestBody.put("temperature", 0.7);
                requestBody.put("max_tokens", 1024);

                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.APPLICATION_JSON);
                headers.setBearerAuth(groqApiKey);

                HttpEntity<String> entity =
                        new HttpEntity<>(objectMapper.writeValueAsString(requestBody), headers);

                ResponseEntity<String> response =
                        restTemplate.exchange(GROQ_URL, HttpMethod.POST, entity, String.class);

                JsonNode root = objectMapper.readTree(response.getBody());
                return root.path("choices").get(0).path("message").path("content").asText();

            } catch (org.springframework.web.client.HttpClientErrorException e) {
                int status = e.getStatusCode().value();
                if (status == 401) {
                    throw new RuntimeException(
                        "Groq API key is invalid or expired. Please update groq.api.key in application.properties. " +
                        "Get a new key at https://console.groq.com/keys");
                } else if (status == 429) {
                    throw new RuntimeException(
                        "Groq API rate limit reached. Please wait a moment and try again.");
                } else if (status == 404 || e.getResponseBodyAsString().contains("model_not_found")) {
                    lastException = e;
                    continue; // try next fallback model (e.g. llama-3.1-8b-instant)
                } else {
                    throw new RuntimeException("Groq API error (HTTP " + status + "): " + e.getResponseBodyAsString());
                }
            } catch (Exception ex) {
                lastException = ex;
            }
        }

        if (lastException != null) {
            throw lastException;
        }
        throw new RuntimeException("Failed to call Groq API with all candidate models.");
    }

    // ─── RESPONSE PARSER + ACTION EXECUTOR ───────────────────────────────────

    private ChatResponse parseAndExecute(String aiContent, User user) {
        try {
            // Check for ```action ... ``` block
            String actionJson = extractActionBlock(aiContent);
            if (actionJson != null) {
                JsonNode actionNode = objectMapper.readTree(actionJson);
                String action = actionNode.path("action").asText("");
                return executeAction(action, actionNode, user);
            }
        } catch (Exception ignored) {
            // If parsing fails, treat as plain text
        }

        // No action detected — return plain text reply
        return ChatResponse.builder()
                .reply(aiContent.trim())
                .build();
    }

    /**
     * Extracts JSON from between ```action and ``` markers.
     */
    private String extractActionBlock(String text) {
        // Try ```action ... ```
        int start = text.indexOf("```action");
        if (start != -1) {
            int jsonStart = text.indexOf('\n', start) + 1;
            int end = text.indexOf("```", jsonStart);
            if (end != -1) {
                return text.substring(jsonStart, end).trim();
            }
        }
        // Also try bare JSON that starts with {"action":
        String trimmed = text.trim();
        if (trimmed.startsWith("{") && trimmed.contains("\"action\"")) {
            return trimmed;
        }
        return null;
    }

    // ─── ACTION DISPATCHER ───────────────────────────────────────────────────

    private ChatResponse executeAction(String action, JsonNode params, User user) {
        try {
            return switch (action) {
                // ── USER actions ─────────────────────────────────────────
                case "initiate_booking"-> handleInitiateBooking(params);
                case "search_parking" -> handleSearchParking(params);
                case "list_parkings"  -> handleListParkings();
                case "my_bookings"    -> handleMyBookings(user.getId());
                case "active_booking" -> handleActiveBooking(user.getId());
                case "cancel_booking" -> handleCancelBooking(params, user.getId());
                case "user_stats"     -> handleUserStats(user.getId());

                // ── OWNER actions ────────────────────────────────────────
                case "create_parking" -> handleCreateParking(params, user.getId());
                case "owner_parkings" -> handleOwnerParkings(user.getId());
                case "owner_bookings" -> handleOwnerBookings(user.getId());
                case "owner_stats"    -> handleOwnerStats(user.getId());

                default -> ChatResponse.builder()
                        .reply("I understood your request but I don't know how to handle the action: " + action)
                        .build();
            };
        } catch (Exception e) {
            return ChatResponse.builder()
                    .reply("Sorry, I ran into an issue executing that action: " + e.getMessage())
                    .build();
        }
    }

    // ─── HANDLER METHODS ─────────────────────────────────────────────────────

    // ── Search Parking by location ──
    private ChatResponse handleSearchParking(JsonNode params) {
        String location = params.path("location").asText("");
        List<UserParkingResponse> all = userParkingService.getAllParkings();

        List<UserParkingResponse> matched = all.stream()
                .filter(p -> p.getLocation().toLowerCase().contains(location.toLowerCase())
                          || p.getName().toLowerCase().contains(location.toLowerCase()))
                .collect(Collectors.toList());

        if (matched.isEmpty()) {
            return ChatResponse.builder()
                    .reply("No parking spaces found near \"" + location + "\". Try a different location!")
                    .action("search_parking")
                    .build();
        }

        StringBuilder sb = new StringBuilder();
        sb.append("🅿️ Found **").append(matched.size()).append("** parking space(s) near \"").append(location).append("\":\n\n");
        for (UserParkingResponse p : matched) {
            sb.append("• **").append(p.getName()).append("** — ").append(p.getLocation()).append("\n");
            sb.append("  Slots: ").append(p.getAvailableSlots()).append(" available / ").append(p.getTotalSlots()).append(" total\n");
            sb.append("  Price: ₹").append(p.getMinCostPerHour()).append(" – ₹").append(p.getMaxCostPerHour()).append("/hr\n\n");
        }
        sb.append("Would you like to book a slot at any of these locations?");

        return ChatResponse.builder()
                .reply(sb.toString())
                .action("search_parking")
                .data(matched)
                .build();
    }

    // ── List all parkings ──
    private ChatResponse handleListParkings() {
        List<UserParkingResponse> all = userParkingService.getAllParkings();

        if (all.isEmpty()) {
            return ChatResponse.builder()
                    .reply("There are currently no parking spaces listed on ParkEase.")
                    .action("list_parkings")
                    .build();
        }

        StringBuilder sb = new StringBuilder();
        sb.append("🅿️ Here are all **").append(all.size()).append("** parking space(s) on ParkEase:\n\n");
        for (UserParkingResponse p : all) {
            sb.append("• **").append(p.getName()).append("** — ").append(p.getLocation()).append("\n");
            sb.append("  Available: ").append(p.getAvailableSlots()).append("/").append(p.getTotalSlots()).append(" slots\n");
            sb.append("  Price: ₹").append(p.getMinCostPerHour()).append(" – ₹").append(p.getMaxCostPerHour()).append("/hr\n\n");
        }

        return ChatResponse.builder()
                .reply(sb.toString())
                .action("list_parkings")
                .data(all)
                .build();
    }

    // ── My Bookings ──
    private ChatResponse handleMyBookings(Long userId) {
        List<BookingResponse> bookings = bookingService.getUserBookings(userId);

        if (bookings.isEmpty()) {
            return ChatResponse.builder()
                    .reply("You don't have any bookings yet. Would you like to search for parking?")
                    .action("my_bookings")
                    .build();
        }

        StringBuilder sb = new StringBuilder();
        sb.append("📋 You have **").append(bookings.size()).append("** booking(s):\n\n");
        for (BookingResponse b : bookings) {
            sb.append("• **Booking #").append(b.getId()).append("** — ").append(b.getParkingName()).append("\n");
            sb.append("  Slot: ").append(b.getSlotCode()).append(" | Status: ").append(b.getStatus()).append("\n");
            sb.append("  Amount: ₹").append(b.getAmount()).append("\n\n");
        }

        return ChatResponse.builder()
                .reply(sb.toString())
                .action("my_bookings")
                .data(bookings)
                .build();
    }

    // ── Active Booking ──
    private ChatResponse handleActiveBooking(Long userId) {
        try {
            BookingResponse active = bookingService.getActiveBooking(userId);
            String reply = String.format(
                    "🚗 Your active booking:\n\n" +
                    "• **%s** — Slot %s\n" +
                    "• Start: %s\n" +
                    "• End: %s\n" +
                    "• Amount: ₹%.2f\n\n" +
                    "Would you like to cancel or extend this booking?",
                    active.getParkingName(), active.getSlotCode(),
                    active.getStartTime(), active.getEndTime(),
                    active.getAmount()
            );
            return ChatResponse.builder()
                    .reply(reply)
                    .action("active_booking")
                    .data(active)
                    .build();
        } catch (RuntimeException e) {
            return ChatResponse.builder()
                    .reply("You don't have any active booking at the moment. Would you like to book a parking slot?")
                    .action("active_booking")
                    .build();
        }
    }

    // ── Cancel Booking ──
    private ChatResponse handleCancelBooking(JsonNode params, Long userId) {
        long bookingId = params.path("bookingId").asLong(0);
        if (bookingId == 0) {
            return ChatResponse.builder()
                    .reply("Please specify the booking ID you want to cancel. You can say \"Show my bookings\" to see your booking IDs.")
                    .build();
        }

        BookingResponse cancelled = bookingService.userCancelBooking(bookingId, userId);
        return ChatResponse.builder()
                .reply("✅ Booking #" + cancelled.getId() + " at " + cancelled.getParkingName() + " has been cancelled successfully!")
                .action("cancel_booking")
                .data(cancelled)
                .build();
    }

    // ── User Stats ──
    private ChatResponse handleUserStats(Long userId) {
        var stats = userDashboardService.getUserStats(userId);
        String reply = String.format(
                "📊 **Your Dashboard Stats:**\n\n" +
                "• Total Bookings: %d\n" +
                "• Active: %d | Completed: %d | Cancelled: %d\n" +
                "• Total Spent: ₹%.2f",
                stats.getTotalBookings(),
                stats.getActiveBookings(), stats.getCompletedBookings(), stats.getCancelledBookings(),
                stats.getTotalAmountSpent()
        );
        return ChatResponse.builder()
                .reply(reply)
                .action("user_stats")
                .data(stats)
                .build();
    }

    // ── Owner Parkings ──
    private ChatResponse handleOwnerParkings(Long ownerId) {
        var parkings = parkingService.getOwnerParkings(ownerId);

        if (parkings.isEmpty()) {
            return ChatResponse.builder()
                    .reply("You haven't added any parking spaces yet. Would you like to add one?")
                    .action("owner_parkings")
                    .build();
        }

        StringBuilder sb = new StringBuilder();
        sb.append("🏢 Your **").append(parkings.size()).append("** parking space(s):\n\n");
        for (var p : parkings) {
            sb.append("• **").append(p.getName()).append("** — ").append(p.getLocation()).append("\n");
            sb.append("  Slots: ").append(p.getTotalSlots()).append(" | Occupied: ").append(p.getOccupied()).append("\n\n");
        }

        return ChatResponse.builder()
                .reply(sb.toString())
                .action("owner_parkings")
                .data(parkings)
                .build();
    }

    // ── Owner Bookings ──
    private ChatResponse handleOwnerBookings(Long ownerId) {
        List<BookingResponse> bookings = bookingService.getAllOwnerBookings(ownerId);

        if (bookings.isEmpty()) {
            return ChatResponse.builder()
                    .reply("No bookings found on your parking spaces yet.")
                    .action("owner_bookings")
                    .build();
        }

        StringBuilder sb = new StringBuilder();
        sb.append("📋 **").append(bookings.size()).append("** booking(s) on your parking spaces:\n\n");
        for (BookingResponse b : bookings) {
            sb.append("• #").append(b.getId()).append(" — ").append(b.getParkingName())
              .append(" | Slot ").append(b.getSlotCode())
              .append(" | ").append(b.getStatus())
              .append(" | ₹").append(b.getAmount()).append("\n");
        }

        return ChatResponse.builder()
                .reply(sb.toString())
                .action("owner_bookings")
                .data(bookings)
                .build();
    }

    // ── Owner Stats ──
    private ChatResponse handleOwnerStats(Long ownerId) {
        OwnerStatsResponse stats = dashboardService.getOwnerStats(ownerId, null);
        String reply = String.format(
                "📊 **Your Owner Dashboard:**\n\n" +
                "• Parking Spaces: %d\n" +
                "• Total Slots: %d (Available: %d, Occupied: %d, Disabled: %d)\n" +
                "• Active Bookings: %d / %d total\n" +
                "• Total Revenue: ₹%.2f",
                stats.getTotalParkings(),
                stats.getTotalSlots(), stats.getAvailableSlots(), stats.getOccupiedSlots(), stats.getDisabledSlots(),
                stats.getActiveBookings(), stats.getTotalBookings(),
                stats.getTotalRevenue()
        );
        return ChatResponse.builder()
                .reply(reply)
                .action("owner_stats")
                .data(stats)
                .build();
    }

    // ── Initiate Booking (Multi-Step) ──
    private ChatResponse handleInitiateBooking(JsonNode params) {
        String parkingName = params.path("parkingName").asText("");
        String slotCode = params.path("slotCode").asText("").toUpperCase();

        // Find the parking space
        List<UserParkingResponse> allParkings = userParkingService.getAllParkings();
        UserParkingResponse matchedParking = null;
        for (UserParkingResponse p : allParkings) {
            // Check if name contains or location contains
            if (p.getName().toLowerCase().contains(parkingName.toLowerCase()) || 
                p.getLocation().toLowerCase().contains(parkingName.toLowerCase())) {
                matchedParking = p;
                break;
            }
        }

        if (matchedParking == null) {
            return ChatResponse.builder()
                    .reply("❌ I couldn't find a parking space named \"" + parkingName + "\". Please try again.")
                    .build();
        }

        // Find the slot
        UserParkingResponse.UserSlotResponse matchedSlot = null;
        for (UserParkingResponse.UserSlotResponse s : matchedParking.getSlots()) {
            if (s.getSlotCode().equalsIgnoreCase(slotCode)) {
                matchedSlot = s;
                break;
            }
        }

        if (matchedSlot == null) {
            return ChatResponse.builder()
                    .reply("❌ Parking space **" + matchedParking.getName() + "** does not have a slot named " + slotCode + ".")
                    .build();
        }

        if (!Boolean.TRUE.equals(matchedSlot.getBookable())) {
            return ChatResponse.builder()
                    .reply("❌ Sorry, slot **" + slotCode + "** is currently unavailable or already occupied.")
                    .build();
        }

        Map<String, Object> data = new HashMap<>();
        data.put("parkingId", matchedParking.getId());
        data.put("parkingName", matchedParking.getName());
        data.put("parkingLocation", matchedParking.getLocation());
        data.put("slotId", matchedSlot.getId());
        data.put("slotCode", matchedSlot.getSlotCode());
        data.put("pricePerHour", matchedSlot.getCostPerHour());

        return ChatResponse.builder()
                .reply("✅ Got it! Redirecting you to the payment page for **" + matchedParking.getName() + "**, Slot: **" + slotCode + "**...")
                .action("initiate_booking")
                .data(data)
                .build();
    }

    // ── Create Parking (Multi-Step) ──
    private ChatResponse handleCreateParking(JsonNode params, Long ownerId) {
        String name = params.path("name").asText("");
        String location = params.path("location").asText("");
        int carCount = params.path("carCount").asInt(0);
        int bikeCount = params.path("bikeCount").asInt(0);
        int largeCount = params.path("largeCount").asInt(0);
        int smallCount = params.path("smallCount").asInt(0);

        try {
            CreateParkingRequest req = new CreateParkingRequest();
            req.setName(name);
            req.setLocation(location);
            req.setDescription("Created via AI Assistant");

            List<CreateParkingRequest.SlotConfig> configs = new ArrayList<>();
            if (carCount > 0) {
                CreateParkingRequest.SlotConfig c = new CreateParkingRequest.SlotConfig();
                c.setVehicleType("CAR"); c.setNumberOfSlots(carCount); c.setCostPerHour(50.0);
                configs.add(c);
            }
            if (bikeCount > 0) {
                CreateParkingRequest.SlotConfig c = new CreateParkingRequest.SlotConfig();
                c.setVehicleType("BIKE"); c.setNumberOfSlots(bikeCount); c.setCostPerHour(20.0);
                configs.add(c);
            }
            if (largeCount > 0) {
                CreateParkingRequest.SlotConfig c = new CreateParkingRequest.SlotConfig();
                c.setVehicleType("LARGE"); c.setNumberOfSlots(largeCount); c.setCostPerHour(100.0);
                configs.add(c);
            }
            if (smallCount > 0) {
                CreateParkingRequest.SlotConfig c = new CreateParkingRequest.SlotConfig();
                c.setVehicleType("SMALL"); c.setNumberOfSlots(smallCount); c.setCostPerHour(10.0);
                configs.add(c);
            }
            req.setSlotConfigs(configs);

            parkingService.createParking(req, ownerId);

            return ChatResponse.builder()
                    .reply("✅ Parking space **" + name + "** has been successfully created!")
                    .action("create_parking")
                    .data(req)
                    .build();
        } catch (Exception e) {
            return ChatResponse.builder()
                    .reply("❌ Error creating parking space: " + e.getMessage())
                    .build();
        }
    }
}
