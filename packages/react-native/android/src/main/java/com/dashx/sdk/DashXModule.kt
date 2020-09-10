package com.dashx.sdk

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableMap

class DashXModule(private val reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    private var dashXClient: DashXClient = DashXClient.instance

    override fun getName(): String {
        return "DashX"
    }

    @ReactMethod
    fun setLogLevel(logLevel: Int) {
        DashXLog.setLogLevel(logLevel)
    }

    @ReactMethod
    fun setup(options: ReadableMap) {
        dashXClient.setPublicKey(options.getString("publicKey")!!)

        if (options.hasKey("trackAppExceptions") && options.getBoolean("trackAppExceptions")) {
            DashXExceptionHandler.enable()
        }

        if (options.hasKey("trackAppLifecycleEvents") && options.getBoolean("trackAppLifecycleEvents")) {
            DashXActivityLifecycleCallbacks.enableActivityLifecycleTracking(reactContext.applicationContext)
        }

        if (options.hasKey("trackScreenViews") && options.getBoolean("trackScreenViews")) {
            DashXActivityLifecycleCallbacks.enableScreenTracking(reactContext.applicationContext)
        }

        if (options.hasKey("baseUri")) {
            options.getString("baseUri")?.let { it ->  dashXClient.setBaseURI(it) }
        }
    }

    @ReactMethod
    fun identify(uid: String?, options: ReadableMap?) {
        dashXClient.identify(uid, options)
    }

    @ReactMethod
    fun reset() {
        dashXClient.reset()
    }

    @ReactMethod
    fun track(event: String, data: ReadableMap?) {
        dashXClient.track(event, data)
    }

    @ReactMethod
    fun screen(screenName: String, data: ReadableMap?) {
        dashXClient.screen(screenName, data)
    }

    init {
        dashXClient.reactApplicationContext = reactContext
        dashXClient.generateAnonymousUid()
    }
}
