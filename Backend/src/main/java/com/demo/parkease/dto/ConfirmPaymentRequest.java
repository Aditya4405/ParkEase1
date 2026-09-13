package com.demo.parkease.dto;

import lombok.Data;

@Data
public class ConfirmPaymentRequest {

    /**
     * "UPI" | "CARD" | "WALLET"
     */
    private String paymentMethod;

    /**
     * For UPI — the ID user typed, e.g. name@okaxis
     * Not stored permanently; used only for mock validation.
     */
    private String upiId;

    /**
     * For CARD — in production this would be a Razorpay/Stripe
     * payment token from their frontend SDK. Never send raw card
     * numbers to your own backend.
     * For this mock, leave null or pass any non-null string.
     */
    private String paymentToken;
}