package com.dashx.sdk

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableMap

class DashXModule(private val reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    private var dashXClient: DashXClient? = null

    override fun getName(): String {
        return "DashX"
    }

    @ReactMethod
    fun setLogLevel(logLevel: Int) {
        DashXLog.setLogLevel(logLevel)
    }

    @ReactMethod
    fun track(event: String, data: ReadableMap?) {
        dashXClient?.track(event, data)
    }

    init {
        dashXClient = DashXClient.instance
        dashXClient?.setReactApplicationContext(reactContext)
        dashXClient?.generateAnonymousUid()
    }
}
