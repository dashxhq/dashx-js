package com.dashx.sdk

import com.google.gson.JsonObject

data class IdentifyRequest(
    val first_name: String?,
    val last_name: String?,
    val email: String?,
    val phone: String?,
    val anonymous_uid: String?
)

data class IdentifyResponse(
    val first_name: String?,
    val last_name: String?,
    val email: String?,
    val phone: String?,
    val uid: String?,
    val anonymous_uid: String?,
    val account_type: String?
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
