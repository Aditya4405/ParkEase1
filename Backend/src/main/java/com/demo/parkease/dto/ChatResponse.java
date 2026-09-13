package com.demo.parkease.dto;

public class ChatResponse {
    private String reply;
    private String action;
    private Object data;

    public ChatResponse() {}

    public ChatResponse(String reply, String action, Object data) {
        this.reply  = reply;
        this.action = action;
        this.data   = data;
    }

    // ── Builder pattern ──────────────────────────────────────────────────────
    public static ChatResponseBuilder builder() {
        return new ChatResponseBuilder();
    }

    public static class ChatResponseBuilder {
        private String reply;
        private String action;
        private Object data;

        public ChatResponseBuilder reply(String reply)   { this.reply  = reply;  return this; }
        public ChatResponseBuilder action(String action) { this.action = action; return this; }
        public ChatResponseBuilder data(Object data)     { this.data   = data;   return this; }

        public ChatResponse build() {
            return new ChatResponse(reply, action, data);
        }
    }

    // ── Getters & Setters ────────────────────────────────────────────────────
    public String getReply()  { return reply; }
    public void setReply(String reply) { this.reply = reply; }

    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }

    public Object getData()   { return data; }
    public void setData(Object data) { this.data = data; }
}
