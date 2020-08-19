@file:JvmName("Utils")
package com.dashx.sdk


import android.content.Context
import android.content.SharedPreferences

fun getPrefKey(context: Context) = "$PACKAGE_NAME.$DEFAULT_INSTANCE.$context.packageName"
fun getDashXSharedPreferences(context: Context): SharedPreferences = context.getSharedPreferences(getPrefKey(context), Context.MODE_PRIVATE)
