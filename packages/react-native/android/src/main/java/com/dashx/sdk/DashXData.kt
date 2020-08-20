package com.dashx.sdk

import com.google.gson.JsonObject

data class TrackRequest(
    val event: String,
    val data: JsonObject
)

data class GenericResponse(
    val success: Boolean
)
