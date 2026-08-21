package com.kalpanaaafinance.modules.shared.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "messages")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Message {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "recipient_user_id", nullable = false)
    private Long recipientUserId;

    @Column(name = "sender_user_id")
    private Long senderUserId;

    @Column(name = "sender_role")
    private String senderRole;

    @Column(name = "subject")
    private String subject;

    @Column(name = "message", columnDefinition = "TEXT", nullable = false)
    private String messageContent;

    @Enumerated(EnumType.STRING)
    @Column(name = "message_type")
    private MessageType messageType;

    @Enumerated(EnumType.STRING)
    @Column(name = "related_entity_type")
    private EntityType relatedEntityType;

    @Column(name = "related_entity_id")
    private Long relatedEntityId;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "read_at")
    private LocalDateTime readAt;

    @Column(name = "is_read")
    private Boolean isRead;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (isRead == null) {
            isRead = false;
        }
    }

    public Boolean getIsRead() { return this.isRead; }
    public void setIsRead(Boolean isRead) { this.isRead = isRead; }
    public LocalDateTime getReadAt() { return this.readAt; }
    public void setReadAt(LocalDateTime readAt) { this.readAt = readAt; }

    public static MessageBuilder builder() {
        return new MessageBuilder();
    }

    public enum MessageType {
        SYSTEM, NOTIFICATION, ALERT, MESSAGE
    }

    public enum EntityType {
        LOAN, DOCUMENT, INVESTMENT, PAYMENT, WALLET, SYSTEM, SUPPORT_TICKET, CONSULTATION
    }
}
