package com.example.shizuka.dto.response;

public class ParticipantResponse {
    private Long id;
    private String participantName;
    private String participantNameKana;
    private String ageGroup;
    private String allergyNote;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

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
