package com.dashx.rn.sdk

import com.dashx.sdk.DashXLog
import com.google.firebase.messaging.FirebaseMessagingService
import com.google.firebase.messaging.RemoteMessage

class DashXMessagingService : FirebaseMessagingService() {
    private val tag = DashXMessagingService::class.java.simpleName
    private val dashXClient = DashXClientInterceptor.instance.getDashXClient()

    override fun onNewToken(token: String) {
        super.onNewToken(token)
        DashXLog.d(tag, "onNewToken: $token")

        if (dashXClient != null) {
            dashXClient.setDeviceToken(token)
        }
    }

    override fun onMessageReceived(remoteMessage: RemoteMessage) {
        super.onMessageReceived(remoteMessage)
        DashXClientInterceptor.instance.handleMessage(remoteMessage)
    }
}
