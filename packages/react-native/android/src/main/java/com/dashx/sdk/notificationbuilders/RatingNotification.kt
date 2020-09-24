@file:JvmName("RatingNotification")

package com.dashx.sdk.notificationbuilders

import android.app.Application
import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Context
import android.content.pm.PackageManager
import android.os.Build
import android.widget.RemoteViews
import androidx.core.app.NotificationCompat
import com.dashx.sdk.DashXClient
import com.dashx.sdk.R
import com.facebook.react.bridge.WritableMap
import java.util.concurrent.atomic.AtomicInteger

fun show(message: WritableMap) {
    val channelId = DashXNotificationChannel.id
    val channelName = DashXNotificationChannel.name
    val id = AtomicInteger(0)
    val notifyId = id.incrementAndGet()

    val applicationContext = DashXClient.instance.reactApplicationContext?.applicationContext as Application
    val currentAppIcon = applicationContext.packageManager.getApplicationInfo(applicationContext.packageName, PackageManager.GET_META_DATA).icon

    val collapsedView = RemoteViews(applicationContext.packageName, R.layout.pn_collapsed)
    collapsedView.setTextViewText(R.id.notificationTitle, "Sample")
    collapsedView.setTextViewText(R.id.notificationTitle, "Sample")

    val ratingView = RemoteViews(applicationContext.packageName, R.layout.pn_rating)
    ratingView.setTextViewText(R.id.notificationTitle, "Sample")
    ratingView.setTextViewText(R.id.notificationText, "Sample")

    val notificationBuilder = NotificationCompat.Builder(applicationContext, channelId)
        .setSmallIcon(currentAppIcon)
        .setCustomContentView(collapsedView)
        .setCustomBigContentView(ratingView)

    val notificationManager: NotificationManager? = applicationContext.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
        val importance = NotificationManager.IMPORTANCE_HIGH
        val channel = NotificationChannel(channelId, channelName, importance)
        channel.setShowBadge(false)

        notificationManager?.apply {
            createNotificationChannel(channel)
            notify(notifyId, notificationBuilder.build())
        }
    } else {
        notificationManager?.notify(notifyId, notificationBuilder.build())
    }
}
