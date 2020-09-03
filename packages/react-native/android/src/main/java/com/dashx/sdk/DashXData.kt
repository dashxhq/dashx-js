package com.dashx.sdk

data class IdentifyRequest(
    val first_name: String?,
    val last_name: String?,
    val email: String?,
    val phone: String?,
    val anonymous_uid: String?
)

data class TrackRequest(
    val event: String,
    val data: JsonObject?,
    val uid: String?,
    val anonymous_uid: String?
)

data class TrackResponse(
    val success: Boolean
)
