import { check, sleep } from "k6";
import http from "k6/http";
import { URLSearchParams } from "https://jslib.k6.io/url/1.0.0/index.js";

// Expected numbers of users that would be using the system
const NORMAL_LOAD_VUS = 1;
const DEFAULT_TIME = "30s";
const BASE_URL = __ENV.URL ? __ENV.URL : "http://backend:8000";

export const options = {
    /*
    By default, k6 reuses connections to improve performance and better simulate real-world 
    scenarios where HTTP connection reuse is common due to keep-alive behavior in HTTP/1.1 and HTTP/2.
    */
    noConnectionReuse: false,
    vus: __ENV.VUS ? parseInt(__ENV.VUS, NORMAL_LOAD_VUS) : NORMAL_LOAD_VUS,
    duration: __ENV.MAX_DURATION ? __ENV.MAX_DURATION : DEFAULT_TIME,
    summaryTimeUnit: "ms",
    userAgent: "MyK6UserAgentString/1.0",
};

export function setup() {
    console.log(`Testing URL: ${BASE_URL}`);
}

export default function () {
    const searchParams = new URLSearchParams([
        ["bus_line", "565"],
        ["start_time", "22:10"],
        ["end_time", "22:15"],
        ["bus_stop", "Geremário Dantas"],
    ]);

    console.log(`${BASE_URL}/infos?${searchParams.toString()}`);

    const res = http.get(`${BASE_URL}/infos?${searchParams.toString()}`);

    check(res, {
        "status is 200": (r) => r.status === 200,
        "response time < 500ms": (r) => r.timings.duration < 500,
    });

    sleep(1);
}
