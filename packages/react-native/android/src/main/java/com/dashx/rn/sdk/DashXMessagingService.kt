package com.dashx.rn.sdk

import android.app.Activity
import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.PendingIntent.FLAG_UPDATE_CURRENT
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.media.RingtoneManager
import android.os.Build
import android.widget.RemoteViews
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import com.dashx.sdk.DashXLog
import com.google.firebase.messaging.FirebaseMessagingService
import com.google.firebase.messaging.RemoteMessage
import com.google.gson.annotations.SerializedName
import com.google.gson.Gson

data class DashXPayload(
    @SerializedName("id") val id: String,
    @SerializedName("title") val title: String?,
    @SerializedName("body") val body: String?,
)

class DashXMessagingService : FirebaseMessagingService() {
    private val tag = DashXMessagingService::class.java.simpleName
    private val dashXClient = DashXClientInterceptor.instance.getDashXClient()
    private val notificationReceiverClass: Class<*> = NotificationReceiver::class.java

    override fun onNewToken(token: String) {
        super.onNewToken(token)
        DashXLog.d(tag, "onNewToken: $token")

        if (dashXClient != null) {
            dashXClient.setDeviceToken(token)
        }
    }

    override fun onMessageReceived(remoteMessage: RemoteMessage) {
        super.onMessageReceived(remoteMessage)

        val gson = Gson()
        val dashxDataMap = remoteMessage.getData()["dashx"]
        var dashxData = gson.fromJson(dashxDataMap, DashXPayload::class.java)

        val id = dashxData.id
        val title = dashxData.title
        val body = dashxData.body

        if ((title != null) || (body != null)) {
            createNotificationChannel()

            NotificationManagerCompat.from(this)
                .notify(id, 1, createNotification(id, title, body))
        }

        DashXClientInterceptor.instance.handleMessage(remoteMessage)
    }

    private fun createNotificationChannel() {

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                CHANNEL_NAME,
                NotificationManager.IMPORTANCE_DEFAULT
            )

            channel.description = CHANNEL_DESCRIPTION

            (getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager)
                .createNotificationChannel(channel)
        }
    }

    private fun createNotification(
        id: String,
        title: String?,
        body: String?
    ) : Notification {
        val intent = getNewBaseIntent()

        val pendingIntent = PendingIntent.getActivity(this, 1, intent, FLAG_UPDATE_CURRENT)

        val notificationBuilder = NotificationCompat.Builder(this, CHANNEL_ID)
            .setSmallIcon(getSmallIcon())
            .setContentTitle(title)
            .setContentText(body)
            .setPriority(NotificationCompat.PRIORITY_DEFAULT)
            .setContentIntent(pendingIntent)
            .setAutoCancel(true)

        return notificationBuilder.build()
    }

    private fun getNewBaseIntent(): Intent {
        return Intent(
            this,
            notificationReceiverClass
        ).addFlags(
            Intent.FLAG_ACTIVITY_SINGLE_TOP or
            Intent.FLAG_ACTIVITY_CLEAR_TOP
        )
    }

    private fun getSmallIcon(): Int {
        val context = getApplicationContext()
        val ai = context.getPackageManager().getApplicationInfo(context.getPackageName(), PackageManager.GET_META_DATA)

        var smallIconInt: Int

        try {
            val smallIcon = ai.metaData.get(DX_NOTIFICATION_ICON)

            if (smallIcon == null) {
                throw IllegalArgumentException()
            }

            smallIconInt = context.getResources().getIdentifier(smallIcon as String, "drawable", context.getPackageName())

            if (smallIconInt == 0) {
                throw IllegalArgumentException()
            }
        } catch (e: IllegalArgumentException) {
            smallIconInt = ai.icon
        }

        return smallIconInt
    }

    companion object {
        private const val CHANNEL_NAME = "DashX Notification"
        private const val CHANNEL_DESCRIPTION = "DashX's default notification channel"
        private const val CHANNEL_ID = "DASHX_NOTIFICATION_CHANNEL"
        private const val DX_NOTIFICATION_ICON = "DX_NOTIFICATION_ICON"
    }
}
