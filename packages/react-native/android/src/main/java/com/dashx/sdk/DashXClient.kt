package com.dashx.sdk

import android.content.SharedPreferences
import com.facebook.react.bridge.ReactApplicationContext
import java.util.*


class DashXClient {
    private var reactApplicationContext: ReactApplicationContext? = null
    private val anonymousUid: String? = null

    fun setReactApplicationContext(reactApplicationContext: ReactApplicationContext?) {
        this.reactApplicationContext = reactApplicationContext
    }

    fun getReactApplicationContext(): ReactApplicationContext? {
        return reactApplicationContext
    }

    fun generateAnonymousUid() {
        val dashXSharedPreferences: SharedPreferences = getDashXSharedPreferences(reactApplicationContext!!.applicationContext)
        var anonymousUid = dashXSharedPreferences.getString(SHARED_PREFERENCES_KEY_ANONYMOUS_UID, null)
        if (anonymousUid != null) {
            anonymousUid = this.anonymousUid
        } else {
            anonymousUid = UUID.randomUUID().toString()
            dashXSharedPreferences.edit()
                .putString(SHARED_PREFERENCES_KEY_ANONYMOUS_UID, anonymousUid)
                .apply()
        }
    }

    companion object {
        private val TAG = DashXClient::class.java.simpleName
        var instance: DashXClient? = null
            get() {
                if (field == null) {
                    field = DashXClient()
                }
                return field
            }
            private set
    }
}
