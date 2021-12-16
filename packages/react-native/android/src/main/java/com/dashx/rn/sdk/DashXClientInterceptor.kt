package com.dashx.rn.sdk

import android.content.Context
import com.dashx.sdk.DashXClient as DashX
import com.dashx.sdk.DashXLog
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule.RCTDeviceEventEmitter
import com.google.firebase.messaging.RemoteMessage

class DashXClientInterceptor private constructor() {
    private val tag = DashXClientInterceptor::class.java.simpleName

    private var client: com.dashx.sdk.DashXClient? = null
    var reactApplicationContext: ReactApplicationContext? = null
    private val dashXNotificationFilter = "DASHX_PN_TYPE"

    fun createDashXClient(reactApplicationContext: ReactApplicationContext, publicKey: String, baseURI: String?, targetEnvironment: String?, targetInstallation: String?) {
        this.reactApplicationContext = reactApplicationContext
        client = DashX(reactApplicationContext.applicationContext, publicKey!!, baseURI, targetEnvironment, targetInstallation)
    }

    fun getDashXClient(): com.dashx.sdk.DashXClient {
        if (client == null) {
            throw Exception("DashXClient not initialised")
        }

        return client!!
    }

    fun handleMessage(remoteMessage: RemoteMessage) {
        val notification = remoteMessage.notification
        val eventProperties: WritableMap = Arguments.createMap()
        DashXLog.d(tag, "Data: " + remoteMessage.data)

        try {
            eventProperties.putMap("data", convertToWritableMap(remoteMessage.data, listOf(dashXNotificationFilter)))
        } catch (e: Exception) {
            DashXLog.d(tag, "Encountered an error while parsing notification data")
            e.printStackTrace()
        }

        if (notification != null) {
            val notificationProperties: WritableMap = Arguments.createMap()
            notificationProperties.putString("title", notification.title)
            notificationProperties.putString("body", notification.body)
            eventProperties.putMap("notification", notificationProperties)
            DashXLog.d(tag, "onMessageReceived: " + notification.title)
        }

        sendJsEvent("messageReceived", eventProperties)
    }

    private fun sendJsEvent(eventName: String, params: WritableMap) {
        reactApplicationContext
            ?.getJSModule(RCTDeviceEventEmitter::class.java)
            ?.emit(eventName, params)
    }

    companion object {
        val instance: DashXClientInterceptor by lazy {
            DashXClientInterceptor()
        }
    }
}
