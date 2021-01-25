#!/bin/bash

count=200
endDate="$(date)"
startDate=$(date --iso-8601=n -d "$endDate - $count day")


for ((i=1;i<=count-100;i++)); 
do
    endDate=$(date --iso-8601=n -d "$startDate + $i day")
    week=$(date -d "$endDate" +'%A')
    random=$(( ( RANDOM % 2 )  + 0 ))
    
    week=$(date -d "$endDate" '+%A')
    if [[ "$week" == "Sunday" ]]; then
        random=$(( ( RANDOM % 1 )  + 0 ))
    fi
    if [[ "$week" == "Saturday" ]]; then
        random=$(( ( RANDOM % 1 )  + 0 ))
    fi
    echo "${endDate}"

    for ((loop=1;loop<=random;loop++)); 
    do
        echo ${loop}
        echo ${i} >> test.txt
        git add .
        git commit -m "test" --quiet
        LC_ALL=C GIT_COMMITTER_DATE="${endDate}" git commit --quiet --amend --no-edit --date "${endDate}')"
    done
done