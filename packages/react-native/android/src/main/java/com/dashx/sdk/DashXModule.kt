package com.dashx.sdk

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableMap
import com.google.android.gms.tasks.OnCompleteListener
import com.google.firebase.iid.FirebaseInstanceId

class DashXModule(private val reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    private val tag = DashXClient::class.java.simpleName
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
        if (options.hasKey("baseUri")) dashXClient.setBaseURI(options.getString("baseUri")!!)

        FirebaseInstanceId.getInstance().instanceId
            .addOnCompleteListener(OnCompleteListener { task ->
                if (!task.isSuccessful) {
                    DashXLog.d(tag, "getInstanceId failed $task.exception")
                    return@OnCompleteListener
                }

                val token = task.result?.token
                token?.let { it -> dashXClient.setDeviceToken(it) }
                DashXLog.d(tag, "Firebase Initialised with: $token")
            })
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
    fun setIdentityToken(identityToken: String) {
        dashXClient.setIdentityToken(identityToken)
    }

    init {
        dashXClient.reactApplicationContext = reactContext
        dashXClient.generateAnonymousUid()
    }
}
