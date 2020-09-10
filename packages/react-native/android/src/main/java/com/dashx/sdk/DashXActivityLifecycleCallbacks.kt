package com.dashx.sdk

import android.app.Activity
import android.app.Application
import android.content.Context
import android.os.Bundle

class DashXActivityLifecycleCallbacks : Application.ActivityLifecycleCallbacks {
    private val dashXClient: DashXClient? = DashXClient.instance
    private var startSession: Double = System.currentTimeMillis().toDouble()

    init {
        dashXClient?.trackAppStarted()
    }

    override fun onActivityPaused(activity: Activity?) {
        dashXClient?.trackAppSession(System.currentTimeMillis().toDouble() - startSession)
    }

    override fun onActivityResumed(activity: Activity?) {
        startSession = System.currentTimeMillis().toDouble()
    }

    override fun onActivityStarted(activity: Activity?) {

    }

    override fun onActivityDestroyed(activity: Activity?) {

    }

    override fun onActivitySaveInstanceState(activity: Activity?, outState: Bundle?) {

    }

    override fun onActivityStopped(activity: Activity?) {

    }

    override fun onActivityCreated(activity: Activity?, savedInstanceState: Bundle?) {

    }

    companion object {
        private var dashXActivityLifecycleCallbacks: DashXActivityLifecycleCallbacks? = null

        fun enableActivityLifecycleTracking(context: Context) {
            if (dashXActivityLifecycleCallbacks != null) {
                return
            }

            dashXActivityLifecycleCallbacks = DashXActivityLifecycleCallbacks()
            val application = context as Application
            application.registerActivityLifecycleCallbacks(dashXActivityLifecycleCallbacks)
        }

        fun enableScreenTracking(context: Context) {
            if (dashXActivityLifecycleCallbacks != null) {
                return
            }

            dashXActivityLifecycleCallbacks = DashXActivityLifecycleCallbacks()
            val application = context as Application
            application.registerActivityLifecycleCallbacks(dashXActivityLifecycleCallbacks)
        }
    }
}
