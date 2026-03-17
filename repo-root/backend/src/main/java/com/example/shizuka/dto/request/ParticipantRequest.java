package com.example.shizuka.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class ParticipantRequest {
    @NotBlank
    @Size(max = 100)
    private String participantName;

    @Size(max = 100)
    private String participantNameKana;

    @Size(max = 50)
    private String ageGroup;

    @Size(max = 255)
    private String allergyNote;

    public String getParticipantName() {
        return participantName;
    }

    public void setParticipantName(String participantName) {
        this.participantName = participantName;
    }

    public String getParticipantNameKana() {
        return participantNameKana;
    }

    public void setParticipantNameKana(String participantNameKana) {
        this.participantNameKana = participantNameKana;
    }

    public String getAgeGroup() {
        return ageGroup;
    }

    public void setAgeGroup(String ageGroup) {
        this.ageGroup = ageGroup;
    }

    public String getAllergyNote() {
        return allergyNote;
    }

    public void setAllergyNote(String allergyNote) {
        this.allergyNote = allergyNote;
    }
}
