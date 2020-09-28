package com.dashx.sdk

import androidx.annotation.IntegerRes
import com.google.gson.JsonObject

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
