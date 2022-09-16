import json
import random

from geopy.geocoders import Nominatim
import spacy


class LocationExtractor:
    def __init__(self):
        print('Initializing.')
        self.model = spacy.load('en_core_web_md')

    def predict(self, X, feature_names):
        print(f'Received request with input X: {X}')
        doc = self.model(str(X[0]))
        print("Analyzing this text:" + doc.text, flush=True)

        locations = []
        if doc.ents:
            print("Found the following entities in this text:" + str(doc.ents), flush=True)
            for ent in doc.ents:
                if ent.label_ == "GPE" or ent.label_ == "LOC":
                    locations.append(ent.text)        
            locs_dict = {}
            if locations:
                print("Those entities were recognized as locations:" + str(locations), flush=True)
                geolocator = Nominatim(user_agent="my_app")
                for idx, location in enumerate(locations):
                    try:
                        loc = geolocator.geocode(location)
                        lat = loc.latitude
                        long = loc.longitude
                        locs_dict[idx+1] = {"extracted location": location, "generated address": loc.address, "latitude": lat - random.uniform(0.05, 2), "longitude": long + random.uniform(0.05, 2)}
                        print("found lat & long for this location: " + str(location), flush=True)
                    except:
                        print("not found lat & long for this location:" + str(location), flush=True)
                jsonDict = json.dumps(locs_dict)
            else:
                print("Not found any location in this text", flush=True)
                jsonDict = {
                    "1": {
                        "extracted location": "none",
                        "generated address": "Brisbane City, Queensland, Australia",
                        "latitude": 0.4689682 - random.uniform(0.1, 5),
                        "longitude": -30.0234991 + random.uniform(0.1, 5)
                    }
                }
        else:
            print("Not found any location in this text", flush=True)
            jsonDict = {
                            "1": {
                                "extracted location": "none",
                                "generated address": "Brisbane City, Queensland, Australia",
                                "latitude": 0.4689682 - random.uniform(0.1, 5),
                                "longitude": -30.0234991 + random.uniform(0.1, 5)
                            }
                        }

        return jsonDict, 200, {'Content-Type': 'application/json; charset=utf-8'}

if __name__ == "__main__":
    p = LocationExtractor()
    
    X = 'My name is Clara and I live in Berkeley, California.'

    prediction = p.predict(X, None)
    print(prediction)
