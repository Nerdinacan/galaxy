// Server delivers an ISO timestamp but without the Z
// convert to local iso javascript date

export function tsToDate(serverStamp) {
    const ts = Date.parse(serverStamp + "Z");
    const serverDate = new Date(ts);
    return serverDate;
}