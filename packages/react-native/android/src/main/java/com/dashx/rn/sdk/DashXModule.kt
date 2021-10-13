package com.dashx.rn.sdk

import com.facebook.react.bridge.*
import com.google.android.gms.tasks.OnCompleteListener
import com.google.firebase.iid.FirebaseInstanceId

class DashXModule(private val reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    private val tag = DashXModule::class.java.simpleName
    private var interceptor: DashXInterceptor = DashXInterceptor.instance


    override fun getName(): String {
        return "DashX"
    }

    @ReactMethod
    fun setLogLevel(logLevel: Int) {
        DashXLog.setLogLevel(logLevel)
    }

    @ReactMethod
    fun setup(options: ReadableMap) {
        interceptor.setPublicKey(options.getString("publicKey")!!)

        if (options.hasKey("accountType")) {
            options.getString("accountType")?.let { interceptor.setAccountType(it) }
        }

        if (options.hasKey("trackAppLifecycleEvents") && options.getBoolean("trackAppLifecycleEvents")) {
            DashXExceptionHandler.enable()
            DashXActivityLifecycleCallbacks.enableActivityLifecycleTracking(reactContext.applicationContext)
        }

        if (options.hasKey("trackScreenViews") && options.getBoolean("trackScreenViews")) {
            DashXActivityLifecycleCallbacks.enableScreenTracking(reactContext.applicationContext)
        }

        if (options.hasKey("baseUri")) {
            options.getString("baseUri")?.let { it -> interceptor.setBaseURI(it) }
        }

        if (options.hasKey("targetEnvironment")) {
            options.getString("targetEnvironment")?.let { it -> interceptor.setTargetEnvironment(it) }
        }

        if (options.hasKey("targetInstallation")) {
            options.getString("targetInstallation")?.let { it -> interceptor.setTargetInstallation(it) }
        }

        interceptor.createDashXClient()

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
    fun screen(screenName: String, data: ReadableMap?) {
        dashXClient.screen(screenName, data)
    }

    @ReactMethod
    fun setIdentityToken(identityToken: String) {
        dashXClient.setIdentityToken(identityToken)
    }

    @ReactMethod
    fun fetchContent(urn: String, options: ReadableMap?, promise: Promise) {
        dashXClient.fetchContent(urn, options, promise)
    }

    @ReactMethod
    fun searchContent(contentType: String, options: ReadableMap?, promise: Promise) {
        dashXClient.searchContent(contentType, options, promise)
    }

    init {
        dashXClient.reactApplicationContext = reactContext
        dashXClient.generateAnonymousUid()
    }
}
