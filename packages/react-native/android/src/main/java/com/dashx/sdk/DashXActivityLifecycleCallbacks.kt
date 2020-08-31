package com.dashx.sdk

import android.app.Activity
import android.app.Application
import android.content.Context
import android.os.Bundle

class DashXActivityLifecycleCallbacks: Application.ActivityLifecycleCallbacks {
    private var startSession: Double = System.currentTimeMillis().toDouble()

    companion object {
        private val dashXClient: DashXClient? = DashXClient.instance
        var instance: DashXActivityLifecycleCallbacks? = null
            get() {
                if (field == null) {
                    field = DashXActivityLifecycleCallbacks()
                }
                val application = dashXClient?.reactApplicationContext?.applicationContext as? Application
                application?.registerActivityLifecycleCallbacks(field)
                return field
            }
            private set
    }

    override fun onActivityPaused(activity: Activity?) {
        TODO("Not yet implemented")
    }

    override fun onActivityResumed(activity: Activity?) {
        TODO("Not yet implemented")
    }

    override fun onActivityStarted(activity: Activity?) {
        TODO("Not yet implemented")
    }

    override fun onActivityDestroyed(activity: Activity?) {
        TODO("Not yet implemented")
    }

    override fun onActivitySaveInstanceState(activity: Activity?, outState: Bundle?) {
        TODO("Not yet implemented")
    }

    override fun onActivityStopped(activity: Activity?) {
        TODO("Not yet implemented")
    }

    override fun onActivityCreated(activity: Activity?, savedInstanceState: Bundle?) {
        TODO("Not yet implemented")
    }
}
