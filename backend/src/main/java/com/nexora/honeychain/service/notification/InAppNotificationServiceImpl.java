package com.nexora.honeychain.service.notification;

import com.nexora.honeychain.model.AIAlert;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class InAppNotificationServiceImpl implements NotificationService {

    private static final Logger logger = LoggerFactory.getLogger(InAppNotificationServiceImpl.class);

    @Override
    public void dispatchNotification(AIAlert alert) {
        if (alert == null) return;
        logger.info("[NOTIFICATION PIPELINE] Alert generated for hive: {}, status: {}, type: {}, message: {}",
                alert.getHive() != null ? alert.getHive().getHiveId() : "N/A",
                alert.getStatus(),
                alert.getAlertType(),
                alert.getMessage());
        // Future channel hooks (Firebase Push / Email / SMS) can be attached here cleanly.
    }
}
