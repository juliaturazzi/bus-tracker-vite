import { check, sleep } from "k6";
import http from "k6/http";
import { URLSearchParams } from "https://jslib.k6.io/url/1.0.0/index.js";

// Expected numbers of users that would be using the system
const NORMAL_LOAD_VUS = 1;
const DEFAULT_TIME = "2m";
const BASE_URL = __ENV.URL ? __ENV.URL : "http://backend:8000";

export const options = {
    /*
    By default, k6 reuses connections to improve performance and better simulate real-world 
    scenarios where HTTP connection reuse is common due to keep-alive behavior in HTTP/1.1 and HTTP/2.
    */
    noConnectionReuse: false,
    vus: __ENV.VUS ? parseInt(__ENV.VUS, 10) : NORMAL_LOAD_VUS,
    duration: __ENV.MAX_DURATION ? __ENV.MAX_DURATION : DEFAULT_TIME,
    summaryTimeUnit: "ms",
    userAgent: "MyK6UserAgentString/1.0",
};

export function setup() {
    console.log(`Testing URL: ${BASE_URL}`);
}

const start_time = "22:10";
const end_time = "22:15";

const users = [
    {
        name: "user1",
        params: {
            bus_line: "565",
            start_time: start_time,
            end_time: end_time,
            bus_stop: "Geremário Dantas",
        },
    },
    {
        name: "user2",
        params: {
            bus_line: "321",
            start_time: start_time,
            end_time: end_time,
            bus_stop: "Tirol",
        },
    },
    {
        name: "user3",
        params: {
            bus_line: "2114",
            start_time: start_time,
            end_time: end_time,
            bus_stop: "Geminiano Góis",
        },
    },
    {
        name: "user4",
        params: {
            bus_line: "2110",
            start_time: start_time,
            end_time: end_time,
            bus_stop: "Bananal",
        },
    },
];

function getRandomUser() {
    const randomIndex = Math.floor(Math.random() * users.length);
    return users[randomIndex];
}

export default function () {
    const user = getRandomUser();
    const { bus_line, start_time, end_time, bus_stop } = user.params;

    const searchParams = new URLSearchParams([
        ["bus_line", bus_line],
        ["start_time", start_time],
        ["end_time", end_time],
        ["bus_stop", bus_stop],
    ]);

    const res = http.get(`${BASE_URL}/infos?${searchParams.toString()}`);

    check(res, {
        "status is 200": (r) => r.status === 200,
        "response time < 3000ms": (r) => r.timings.duration < 3000,
    });

    sleep(5);
}
