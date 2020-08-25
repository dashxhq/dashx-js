package com.dashx.sdk

import com.google.gson.JsonObject

data class TrackRequest(
    val uid: String?,
    val event: String,
    val data: JsonObject?
)

data class GenericResponse(
    val success: Boolean
)
