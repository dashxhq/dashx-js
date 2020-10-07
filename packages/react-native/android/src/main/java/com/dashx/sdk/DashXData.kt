package com.dashx.sdk

import com.google.gson.JsonObject
import okhttp3.Callback
import java.sql.Timestamp

data class IdentifyRequest(
    val firstName: String?,
    val lastName: String?,
    val email: String?,
    val phone: String?,
    val anonymousUid: String?
)

data class TrackRequest(
    val event: String,
    val data: JsonObject?,
    val uid: String?,
    val anonymousUid: String?
)

data class SubscribeRequest(
    val value: String,
    val kind: String,
    val uid: String?,
    val anonymousUid: String?
)

data class ContentRequest(
    val contentType: String,
    val returnType: String?,
    val filter: JsonObject?,
    val order: JsonObject?,
    val limit: Int?,
    val page: Int?
)

data class DashXRequest(
    val timestamp: Long,
    val uri: String,
    val body: Any,
    val callback: Callback
): Comparable<DashXRequest> {
    override fun compareTo(other: DashXRequest): Int {
        return (other.timestamp - this.timestamp).toInt()
    }
}
