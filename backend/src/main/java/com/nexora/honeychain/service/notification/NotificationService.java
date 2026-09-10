package com.nexora.honeychain.service.notification;

import com.nexora.honeychain.model.AIAlert;

/**
 * Abstraction for notification pipeline.
 * Supports current in-app (REST polling) channels and provides clean hooks for
 * future channels (e.g. Firebase push, Email, SMS).
 */
public interface NotificationService {
    void dispatchNotification(AIAlert alert);
}
