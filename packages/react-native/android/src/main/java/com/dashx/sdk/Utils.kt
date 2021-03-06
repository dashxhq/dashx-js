@file:JvmName("Utils")

package com.dashx.sdk

import android.content.Context
import android.content.SharedPreferences
import android.content.pm.PackageInfo
import android.content.pm.PackageManager
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.ReadableType
import com.facebook.react.bridge.WritableMap
import com.facebook.react.bridge.WritableNativeMap
import com.google.gson.JsonArray
import com.google.gson.JsonObject
import org.json.JSONException

fun getPackageInfo(context: Context): PackageInfo = context.packageManager.getPackageInfo(context.packageName, PackageManager.GET_META_DATA)
fun getPrefKey(context: Context) = "$PACKAGE_NAME.$DEFAULT_INSTANCE.$context.packageName"
fun getDashXSharedPreferences(context: Context): SharedPreferences = context.getSharedPreferences(getPrefKey(context), Context.MODE_PRIVATE)

@Throws(JSONException::class)
fun convertMapToJson(readableMap: ReadableMap?): JsonObject? {
    val iterator = readableMap?.keySetIterator() ?: return null
    val jsonObject = JsonObject()
    while (iterator.hasNextKey()) {
        val key = iterator.nextKey()
        when (readableMap.getType(key)) {
            ReadableType.Null -> jsonObject.add(key, null)
            ReadableType.Boolean -> jsonObject.addProperty(key, readableMap.getBoolean(key))
            ReadableType.Number -> jsonObject.addProperty(key, readableMap.getDouble(key))
            ReadableType.String -> jsonObject.addProperty(key, readableMap.getString(key))
            ReadableType.Map -> jsonObject.add(key, convertMapToJson(readableMap.getMap(key)))
            ReadableType.Array -> jsonObject.add(key, convertArrayToJson(readableMap.getArray(key)))
        }
    }
    return jsonObject
}

@Throws(JSONException::class)
fun convertArrayToJson(readableArray: ReadableArray?): JsonArray {
    val jsonArray = JsonArray()
    for (i in 0 until readableArray!!.size()) {
        when (readableArray.getType(i)) {
            ReadableType.Null -> {
            }
            ReadableType.Boolean -> jsonArray.add(readableArray.getBoolean(i))
            ReadableType.Number -> jsonArray.add(readableArray.getDouble(i))
            ReadableType.String -> jsonArray.add(readableArray.getString(i))
            ReadableType.Map -> jsonArray.add(convertMapToJson(readableArray.getMap(i)))
            ReadableType.Array -> jsonArray.add(convertArrayToJson(readableArray.getArray(i)))
        }
    }
    return jsonArray
}

@JvmOverloads
@Throws(Exception::class)
fun convertToWritableMap(map: Map<*, *>, blacklist: List<String> = emptyList<String>()): WritableMap {
    val writableMap: WritableMap = WritableNativeMap()
    val iterator: Iterator<String> = map.keys.iterator() as Iterator<String>
    while (iterator.hasNext()) {
        val key = iterator.next()

        if (blacklist.contains(key)) {
            continue;
        }

        when (val value = map[key]) {
            is Boolean -> writableMap.putBoolean(key, (value as Boolean?)!!)
            is Int -> writableMap.putInt(key, (value as Int?)!!)
            is Double -> writableMap.putDouble(key, (value as Double?)!!)
            is String -> writableMap.putString(key, value as String?)
            else -> writableMap.putString(key, value.toString())
        }
    }
    return writableMap
}

fun ReadableMap.getMapIfPresent(key: String): ReadableMap? {
    return if (this.hasKey(key)) this.getMap(key) else null
}

fun ReadableMap.getIntIfPresent(key: String): Int? {
    return if (this.hasKey(key)) this.getInt(key) else null
}

fun ReadableMap.getStringIfPresent(key: String): String? {
    return if (this.hasKey(key)) this.getString(key) else null
}

fun ReadableMap.getBooleanIfPresent(key: String): Boolean? {
    return if (this.hasKey(key)) this.getBoolean(key) else null
}
