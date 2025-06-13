#!/bin/bash

NORMAL='\033[0;39m'
BLUE='\033[1;34m'
GREEN='\033[1;32m'
RED='\033[1;31m'


echo -e "$BLUE#####################################################################################################################################"
echo -e "#  Script to search for the stops based on the stopIDs                                                                              #"
echo -e "#  For the Hanover area you should search from stopID 24999000 to 25020000.                                                         #"
echo -e "#  It can happen that no transport company or transport association can be found for individual stops.                              #"
echo -e "#  This is due to the fact that the stop is not being served while the script is running (depending on the time).                   #"
echo -e "#  If this is important for the stop, simply start the script at a different time (e.g. 12:00 p.m.).                                #"
echo -e "#####################################################################################################################################"
echo -e "$NORMAL"
read -p "Press enter to continue if you are sure. Else use [CTRL] + [C]."
clear && printf '\e[3J'

function checkInt {
    number="$1"
    # min int
    min=0
    # max int
    max=2147483647
    if [ -z $number ]
    then
        echo "ERROR: No input. Script exit."
        sleep 1
        exit 1
    fi
    # maybe negativ ...
    if [ "${number%${number#?}}" = "-" ]
    then
        testinteger="${number#?}"
    else
        testinteger="$number"
    fi

    # remove alpha etc ...
    extract_nodigits="`echo $testinteger | \
                      sed 's/[[:digit:]]//g'`"
    # Ist jetzt noch was vorhanden
    if [ ! -z $extract_nodigits ]
    then
        echo "ERROR: Is no [num]"
        return 1
    fi

    # check min ...
    if [ "$number" -lt "$min" ]
    then
        echo "ERROR: Value under min : $min"
        return 1
    fi
    # max. Grenze eingehalten
    if [ "$number" -gt "$max" ]
    then
        echo "ERROR: Value over max : $max"
        return 1
    fi
    return 0
}

function exitFunction {
    clear && printf '\e[3J'
    exit
}

function readmeFunction {
    echo "little readme. (comming soon)"
    read -p "Press enter to continue if you are sure. Else use [CTRL] + [C]."
    indexFunction
}

# 1. Create ProgressBar function
# 1.1 Input is currentState($1) and totalState($2)
function ProgressBar {
    # Process data
    let _progress=(${1}*100/${2}*100)/100
    let _done=(${_progress}*4)/10
    let _left=40-$_done
    # Build progressbar string lengths
    _fill=$(printf "%${_done}s")
    _empty=$(printf "%${_left}s")

    # 1.2 Build progressbar strings and print the ProgressBar line
    # 1.2.1 Output example:                           
    # 1.2.1.1 Progress : [########################################] 100%
    printf "\rProgress : [${_fill// /#}${_empty// /-}] ${_progress}%%"
}


function areasearchFunction {

    echo -e "$BLUE#####################################################################################################################################"
    echo -e "#  From where should the search begin?                                                                                              #"
    echo -e "#####################################################################################################################################"
    echo -e "$NORMAL"
    read -p "" i
    i=$i

    if ! checkInt "$i"
    then
        echo "ERROR: Wrong input: no integer"
        sleep 1
        areasearchFunction
    fi

    echo -e "$BLUE#####################################################################################################################################"
    echo -e "#  To where should you search?                                                                                                      #"
    echo -e "#####################################################################################################################################"
    echo -e "$NORMAL"
    read -p "" j
    j=$j

    if ! checkInt "$j"
    then
        echo "ERROR: Wrong input: no integer"
        sleep 1
        areasearchFunction
    fi

    if [ $i -gt $j ]
    then
        echo "ERROR"
        echo "The beginning stopID must be less or equal from the ending stopID."
        echo "Please restart."
        sleep 5
        indexFunction
    fi

    _barend="$(($j-$i))"

    echo -e "$BLUE#####################################################################################################################################"
    echo -e "#  Number of stopIDs to be searched: " $_barend "                                                                                   #"
    echo -e "#####################################################################################################################################"
    echo -e "$NORMAL"

    read -p "Press enter to continue if you are sure. Else use [CTRL] + [C]."

    clear && printf '\e[3J'

    echo "Deleting old files in result/area/"

    for file in result/area/*.json; do
        if [ -f $file ]; then
            rm $file
            echo -e "$GREEN"
            echo $file " deleted."
        fi
    done

    echo "All not neccessary files are deleted."
    sleep 1

    _start=$i
    _barend="$(($j-$i))"

    DAY=`date +"%Y%m%d"`
    HOUR=`date +"%H%M"`

    clear && printf '\e[3J'

    until [ $i -gt $j ]
    do
        _barstart="$(($i-$_start))"

        echo -e "$NORMAL"
        ProgressBar ${_barstart} ${_barend}
        echo -e "$BLUE"
        echo "Try stop: " $i "; Start at:" $_start "; End at:" $j"; Total search:" $_barend

        # get result from stopID with curl and save to temp json file; -# means that is schon a progressbar during download instead the full context; -H means header injection; -s means silent, possible to use instead of -#
        curl -#H "Content-Type: application/json" -XGET "http://efa107.efa.de/efaws2/default/XML_DM_REQUEST?sessionID=0&requestID=0&language=de&useRealtime=true&mode=direct&dmLineSelectionAll=1&name_dm="$i"&type_dm=stop&line=&outputFormat=json&limit=10&itdTime="$HOUR"&itdDate="$DAY"&outputEncoding=UTF-8&inputEncoding=UTF-8&mId=efa_www" -H 'cache-control: no-cache' -o result/area/result-"$i".json

        # jq with filter
        jq 'select(.dm.points != null)|{station: {id: .dm.points.point.stateless, name: .dm.points.point.name, place: .dm.points.point.ref.place, lines:[.servingLines.lines[] | .mode | {product: .product, number: .number, destination: .destination, network: .diva.network, operator: .diva.operator, stateless: .diva.stateless}]}}' < result/area/result-"$i".json > result/area/result-new-"$i".json

        rm result/area/result-"$i".json
        clear && printf '\e[3J'

        i=$(( $i + 1 ))
    done

    echo "Deleting files with no results..."
    for file in result/area/*.json; do
        if [ ! -s $file ]; then
            rm $file
        fi
    done

    echo "Compare json results..."
    jq -n '[ inputs[]]' result/area/*.json >> result/area/result-"$_start"-"$j".json

    echo "Move result...or not..."

    erg="n"
    if [ -f result/area/search/result-"$_start"-"$j".json ]
    then
        echo -e "$RED#####################################################################################################################################"
        echo -e "#  File already exists. Overwrite? (y/n)                                                                                            #"
        echo -e "#####################################################################################################################################"
        echo -e "$NORMAL"
        read -p "" erg
        erg=$erg
    else
        echo "Moving file..."
        mv result/area/result-"$_start"-"$j".json result/area/search/
        sleep 1
    fi

    if [ $erg == "y" ]
    then
        echo "Moving and overwriting file"
        mv result/area/result-"$_start"-"$j".json result/area/search/
        sleep 1 
    fi

    if [ $erg == "n" ]
    then
        echo "Moving and overwriting file is aborted..."
        sleep 1 
    fi


    echo "Deleting useless files..."
    for file in result/area/result-new-*.json; do
        if [ -f $file ]; then
            rm $file
        fi
    done

    sleep 1

    clear && printf '\e[3J'
    echo -e "$GREEN"
    echo "The results were saved in result/area/."
    read -p "Press enter to return to index. Else use [CTRL] + [C]."
    clear && printf '\e[3J'
    indexFunction

}


# not jet implemented
function temporalsearchFunction {
    indexFunction
}


function stationsearchbynameFunction {
    echo -e "$BLUE#####################################################################################################################################"
    echo -e "#  Which station should be searched for? (Resultlist has a maximum of 50 entries.)                                                  #"
    echo -e "#####################################################################################################################################"
    echo -e "$NORMAL"
    read -p "" name
    name=$name

    # get result from name with curl and save to temp json file; -# means that is a progressbar during download instead the full context; -H means header injection; -s means silent, possible to use instead of -#
    curl -#H "Content-Type: application/json" -XGET "http://efa107.efa.de/efaws2/default/XML_STOPFINDER_REQUEST?outputFormat=JSON&coordOutputFormat=WGS84[DD.ddddd]&locationServerActive=1&anyMaxSizeHitList=50&type_sf=any&anyResSort_sf=NDS&name_sf="$name"&anyObjFilter_sf=2&outputEncoding=UTF-8,UTF-8&inputEncoding=UTF-8,UTF-8&mId=efa_www" -H 'cache-control: no-cache' -o result/name/result-search-name.json
    # jq with filter
    jq 'select(.stopFinder.points != null)|{station: {searchName: .stopFinder.input.input,    result:[.stopFinder.points[]  | {name: .name, stopID: .stateless}]   }}' < result/name/result-search-name.json > result/name/result-search-"$name".json

    rm result/name/result-search-name.json
    clear && printf '\e[3J'

    if [ ! -s result/name/result-search-"$name".json ]
    then
        echo -e "$RED"
        echo "No result."
        read -p "Press enter to return to index. Else use [CTRL] + [C]."
        rm result/name/result-search-"$name".json
        clear && printf '\e[3J'
        indexFunction

    else
        echo -e "$GREEN"
        echo "The results were saved in result/result-search-"$name".json."
        cat result/name/result-search-"$name".json
        echo "For full station result use option [A] with known stopID from results."
        read -p "Press enter to return to index. Else use [CTRL] + [C]."
        clear && printf '\e[3J'
        indexFunction
    fi

    clear && printf '\e[3J'
    indexFunction

}


function indexFunction {

# make dir if not exist
echo -e "$BLUE"
if [ ! -e result/area/search ]; then
    mkdir result/area/search;
fi
if [ ! -e result/name ]; then
    mkdir result/name;
fi
#sudo mkdir result
#clear && printf '\e[3J'


echo -e "$BLUE#####################################################################################################################################"
echo -e "#  Pick a letter to run a command [A, or B for more info].                                                                          #"
echo -e "#  Select [A] for a stopID area search.                                                                                             #"
echo -e "#  Select [B] for a temporal search for a dedicatet stopID. (comming soon)                                                          #"
echo -e "#  Select [C] for a search by name. (comming soon)                                                                                  #"
echo -e "#  Select [R] Readme                                                                                                                #"
echo -e "#  Select [X] Exit                                                                                                                  #"
echo -e "#####################################################################################################################################"
echo -e "$NORMAL"
read -n1 -p "" runCommand

        case $runCommand in
            a|A) printf "\nArea search will start...\n" && areasearchFunction;;
            b|B) printf "\nTemporal search will start...\n" && temporalsearchFunction;;
            c|C) printf "\nSearch by name...\n" && stationsearchbynameFunction;;
            r|R) printf "\nOption A runs area search, option B runs temporal search\n" && readmeFunction;;
            x|X) printf "" && exitFunction;;
        esac
}

indexFunction
