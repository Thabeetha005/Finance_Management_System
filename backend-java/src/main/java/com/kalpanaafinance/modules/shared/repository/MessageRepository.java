package com.kalpanaafinance.modules.shared.repository;

import com.kalpanaafinance.modules.shared.entity.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {
    List<Message> findByRecipientUserIdOrderByCreatedAtDesc(Long recipientUserId);
    long countByRecipientUserIdAndIsReadFalse(Long recipientUserId);
    List<Message> findBySenderUserIdOrderByCreatedAtDesc(Long senderUserId);
    List<Message> findByRelatedEntityTypeAndRelatedEntityIdOrderByCreatedAtDesc(Message.EntityType relatedEntityType, Long relatedEntityId);
}
