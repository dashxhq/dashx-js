package com.dashx.rn.sdk

import com.facebook.react.bridge.*
import com.dashx.sdk.DashXLog
import com.google.android.gms.tasks.OnCompleteListener
import com.google.firebase.iid.FirebaseInstanceId

class DashXModule(private val reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    private val tag = DashXModule::class.java.simpleName
    private var interceptor: DashXClientInstance = DashXClientInstance.instance


    override fun getName(): String {
        return "DashX"
    }

    @ReactMethod
    fun setLogLevel(logLevel: Int) {
        DashXLog.setLogLevel(logLevel)
    }

    @ReactMethod
    fun setup(options: ReadableMap) {
        interceptor.reactApplicationContext = reactContext
        interceptor.createDashXClient(
            options.getString("publicKey")!!,
            options.getStringIfPresent("baseUri"),
            options.getStringIfPresent("accountType"),
            options.getStringIfPresent("targetEnvironment"),
            options.getStringIfPresent("targetInstallation")
        )

        if (options.hasKey("trackAppLifecycleEvents") && options.getBoolean("trackAppLifecycleEvents")) {
            DashXExceptionHandler.enable()
            DashXActivityLifecycleCallbacks.enableActivityLifecycleTracking(reactContext.applicationContext)
        }

        if (options.hasKey("trackScreenViews") && options.getBoolean("trackScreenViews")) {
            DashXActivityLifecycleCallbacks.enableScreenTracking(reactContext.applicationContext)
        }

        FirebaseInstanceId.getInstance().instanceId
            .addOnCompleteListener(OnCompleteListener { task ->
                if (!task.isSuccessful) {
                    DashXLog.d(tag, "getInstanceId failed $task.exception")
                    return@OnCompleteListener
                }

                val token = task.result?.token
                token?.let { it -> interceptor.getDashXClient().setDeviceToken(it) }
                DashXLog.d(tag, "Firebase Initialised with: $token")
            })
    }

    @ReactMethod
    fun identify(uid: String?, options: ReadableMap?) {
        val optionsHashMap = options?.toHashMap()
        interceptor.getDashXClient().identify(uid, optionsHashMap as HashMap<String, String>)
    }

    @ReactMethod
    fun reset() {
        interceptor.getDashXClient().reset()
    }

    @ReactMethod
    fun track(event: String, data: ReadableMap?) {
        val jsonData = try {
            data?.toHashMap() as HashMap<String, String>
        } catch (e: Exception) {
            DashXLog.d(tag, "Encountered an error while parsing data")
            e.printStackTrace()
            return
        }

        interceptor.getDashXClient().track(event, jsonData)
    }

    @ReactMethod
    fun screen(screenName: String, data: ReadableMap?) {
        interceptor.getDashXClient().screen(screenName, data?.toHashMap() as HashMap<String, String>)
    }

    @ReactMethod
    fun setIdentityToken(identityToken: String) {
        dashXClient.setIdentityToken(identityToken)
    }

    @ReactMethod
    fun fetchContent(urn: String, options: ReadableMap?, promise: Promise) {
        interceptor.getDashXClient().fetchContent(
            urn,
            options?.getBooleanIfPresent("preview"),
            options?.getStringIfPresent("language"),
            options?.getArray("fields")?.toArrayList() as List<String>?,
            options?.getArray("include")?.toArrayList() as List<String>?,
            options?.getArray("exclude")?.toArrayList() as List<String>?,
            onError = {
                promise.reject("EUNSPECIFIED", it)
            },
            onSuccess = {
                promise.resolve(it)
            }
        )
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
