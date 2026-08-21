package com.kalpanaaafinance.modules.shared.service;

import com.kalpanaaafinance.modules.shared.entity.Message;
import com.kalpanaaafinance.modules.shared.repository.MessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MessageService {

    private final MessageRepository messageRepository;

    @Transactional
    public Message sendAdminMessage(Long recipientId, Long adminId, String subject, String content) {
        Message message = Message.builder()
                .recipientUserId(recipientId)
                .senderUserId(adminId)
                .senderRole("ADMIN")
                .subject(subject)
                .messageContent(content)
                .messageType(Message.MessageType.MESSAGE)
                .isRead(false)
                .build();
        return messageRepository.save(message);
    }

    @Transactional
    public Message sendSystemMessage(Long recipientId, String subject, String content, Message.EntityType entityType, Long entityId) {
        Message message = Message.builder()
                .recipientUserId(recipientId)
                .senderRole("SYSTEM")
                .subject(subject)
                .messageContent(content)
                .messageType(Message.MessageType.SYSTEM)
                .relatedEntityType(entityType)
                .relatedEntityId(entityId)
                .isRead(false)
                .build();
        return messageRepository.save(message);
    }

    @Transactional
    public void markAsRead(Long messageId) {
        messageRepository.findById(messageId).ifPresent(message -> {
            message.setIsRead(true);
            message.setReadAt(LocalDateTime.now());
            messageRepository.save(message);
        });
    }
    
    @Transactional
    public void markAllAsRead(Long userId) {
        List<Message> unread = messageRepository.findByRecipientUserIdOrderByCreatedAtDesc(userId).stream()
                .filter(m -> !Boolean.TRUE.equals(m.getIsRead()))
                .toList();
        unread.forEach(m -> {
            m.setIsRead(true);
            m.setReadAt(LocalDateTime.now());
        });
        messageRepository.saveAll(unread);
    }
}
