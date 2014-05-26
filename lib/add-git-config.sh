#!/bin/bash

# {
#     consumer_key: '9ujQ0DFkKffmMyfGCEiSMrNTL',
#     consumer_secret: 'a1KA9bFwBKEZWSq9TsxOWKJputgYOfHgU06kRpcP6WSo0BdLmr',
#     token: '308884292-Rgb7vx2XYN0ucBhHNepn372v1BvDpAZ9PNUC2vpX',
#     token_secret: 'eXhAFXUKxqr2iJ8iHtzWvpA7iB3WvNX0Y0ms1ixOlMF35'
# }

# Array pretending to be a Pythonic dictionary
Twitter=( "twitter.consumer-key:9ujQ0DFkKffmMyfGCEiSMrNTL"
        "twitter.consumer-secret:a1KA9bFwBKEZWSq9TsxOWKJputgYOfHgU06kRpcP6WSo0BdLmr"
        "twitter.token:308884292-Rgb7vx2XYN0ucBhHNepn372v1BvDpAZ9PNUC2vpX"
        "twitter.token-secret:eXhAFXUKxqr2iJ8iHtzWvpA7iB3WvNX0Y0ms1ixOlMF35" )

Facebook=( "facebook.token:CAACEdEose0cBAN7DYi7A8kxCLYR3RMZBiXGqJkVZAbLx2CLx6e6l9ZAyqjgoz2Fnph7SLptXhUfEZCTIxEMgKTBvK39DktIL7upRY6HPv7ry8CQZCZB55w2XKmmMeSMWE3EyzhFJBz22RaZBNkewMS7xozf5ZAPBkUSZB6bCfwaa5yWLDQBiZC5BZArUo5ChzZCXKgYZD" )

git config --global --remove-section twitter
git config --global --remove-section facebook

for cfg in "${Twitter[@]}" ; do
    KEY="${cfg%%:*}"
    VALUE="${cfg##*:}"

    # printf "%s is %s.\n" "$KEY" "$VALUE"

    echo "Start to config $KEY to git"

    git config --global --add $KEY $VALUE

done


for cfg in "${Facebook[@]}" ; do
    KEY="${cfg%%:*}"
    VALUE="${cfg##*:}"

    # printf "%s is %s.\n" "$KEY" "$VALUE"

    echo "Start to config $KEY to git"

    git config --global --add $KEY $VALUE

done

echo 'All config finished!'

git config --global -l

# printf "%s is an extinct animal which likes to %s\n" "${Twitter[1]%%:*}" "${Twitter[1]##*:}"


