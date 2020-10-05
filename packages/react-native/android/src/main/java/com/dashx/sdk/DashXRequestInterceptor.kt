package com.dashx.sdk

import android.content.Intent
import android.content.IntentFilter
import android.os.BatteryManager
import okhttp3.Interceptor
import okhttp3.Request
import okhttp3.Response
import kotlin.math.pow

class DashXRequestInterceptor(
    private val exponentialBackoffScale: Double = 0.5,
    private val exponentialBackoffBase: Double = 2.0,
    private val retryLimit: Int = 3
) : Interceptor {
    private fun shouldRetry(request: Request, response: Response): Boolean {
        val retryableStatusCodes = listOf<Int>(408, 500, 502, 503, 504)
        if (retryableStatusCodes.contains(response.code)) return true
        if (request.method == "POST") return true
        return false
    }

    private fun getTimeDelay(retryCount: Int): Long {
        val context = DashXClient.instance.reactApplicationContext
        val batteryStatus: Intent? = IntentFilter(Intent.ACTION_BATTERY_CHANGED).let { ifilter ->
            context?.registerReceiver(null, ifilter)
        }
        val extraStatus = batteryStatus?.getIntExtra(BatteryManager.EXTRA_STATUS, -1)

        return if (extraStatus == BatteryManager.BATTERY_STATUS_CHARGING) {
            (exponentialBackoffBase.pow(retryCount) * exponentialBackoffScale).toLong()
        } else {
            (exponentialBackoffBase.pow(retryCount + 1) * exponentialBackoffScale).toLong()
        }
    }

    override fun intercept(chain: Interceptor.Chain): Response {
        val request = chain.request()
        var response = chain.proceed(request)
        var retryCount = 0

        while (shouldRetry(request, response) && retryLimit > retryCount) {
            Thread.sleep(getTimeDelay(retryCount))
            retryCount++
            response = chain.proceed(request)
        }

        return response
    }
}
