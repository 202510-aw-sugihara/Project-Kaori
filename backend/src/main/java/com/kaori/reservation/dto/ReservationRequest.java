package com.kaori.reservation.dto;

import jakarta.validation.constraints.Pattern;

public class ReservationRequest {
    private Long courseId;
    private Long slotId;
    @Pattern(
        regexp = "^[\\u30A0-\\u30FF\\u30FC\\u30FB\\s]+$",
        message = "Name must be full-width Katakana."
    )
    private String name;
    private String email;
    private String phone;
    private Integer people;
    private String note;

    // Getters and Setters
    public Long getCourseId() {
        return courseId;
    }

    public void setCourseId(Long courseId) {
        this.courseId = courseId;
    }

    public Long getSlotId() {
        return slotId;
    }

    public void setSlotId(Long slotId) {
        this.slotId = slotId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
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

    public Integer getPeople() {
        return people;
    }

    public void setPeople(Integer people) {
        this.people = people;
    }

    public String getNote() {
        return note;
    }

    public void setNote(String note) {
        this.note = note;
    }
}
