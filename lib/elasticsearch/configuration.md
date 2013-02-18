Create the mapping as follows:

~~~bash
  #create the index
  curl -XPUT '{{url}}/documents'

  #create the mapping
  curl -XPUT '{{URL}}/documents/doc/_mapping' -d '
  {
    "doc": {
      "properties": {
        "companies": {
          "type": "string",
          "analyzer": "keyword"
        },
        "content": {
          "type": "string"
        },
        "createdAt": {
          "type": "object",
          "dynamic": "true"
        },
        "lastAccess": {
          "type": "object",
          "dynamic": "true"
        },
        "lastUpdate": {
          "type": "object",
          "dynamic": "true"
        },
        "name": {
          "type": "string"
        },
        "tags": {
          "type": "string",
          "analyzer": "keyword"
        },
        "users": {
          "type": "string",
          "analyzer": "keyword"
        }
      }
    }
  }'
~~~