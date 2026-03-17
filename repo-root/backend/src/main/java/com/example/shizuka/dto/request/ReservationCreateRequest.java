package com.example.shizuka.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

public class ReservationCreateRequest {
    @NotNull
    private Long planId;

    @NotNull
    private Long planTimeSlotId;

    @NotNull
    @Min(1)
    private Integer participantCount;

    @NotNull
    @Size(min = 1)
    @Valid
    private List<ParticipantRequest> participants;

    @NotNull
    @Size(max = 100)
    private String customerName;

    @NotNull
    @Size(max = 255)
    private String email;

    @NotNull
    @Size(max = 20)
    private String phone;

    public Long getPlanId() {
        return planId;
    }

    public void setPlanId(Long planId) {
        this.planId = planId;
    }

    public Long getPlanTimeSlotId() {
        return planTimeSlotId;
    }

    public void setPlanTimeSlotId(Long planTimeSlotId) {
        this.planTimeSlotId = planTimeSlotId;
    }

    public Integer getParticipantCount() {
        return participantCount;
    }

    public void setParticipantCount(Integer participantCount) {
        this.participantCount = participantCount;
    }

    public List<ParticipantRequest> getParticipants() {
        return participants;
    }

    public void setParticipants(List<ParticipantRequest> participants) {
        this.participants = participants;
    }

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }
}
