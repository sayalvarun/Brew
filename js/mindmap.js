// Network not yet initialized
var network = null
// NO nodes and edges initially
var nodes = new vis.DataSet([]);
var edges = new vis.DataSet([]);
// Queue to allocate and deallocate new node id's
var releasedIds = []
// The node id to default edge attachments to
var defaultNode = null

// Key code to listen for enter key press
let ENTER_KEY_CODE = 13
// Maximum number of nodes on a network => n^2 supported edges....
let MAX_SUPPORTED_NODES = 1000000
// The thesauraus for related words
var RELATED_THESAURUS = null

var initGraph = function() {

  // create a network
  var container = document.getElementById("mynetwork");

  // provide the data in the vis format
  var data = {
      nodes: nodes,
      edges: edges
  };
  var options = {
      nodes: {
          shape: "box",
          font: "20px arial black",
          shadow: true
      }
  };

  // initialize your network!
  network = new vis.Network(container, data, options);
}

var initQueue = function() {
  for(var i=1; i<MAX_SUPPORTED_NODES; i++) {
    releasedIds.push(i)
  }
}

var getFreeId = function() {
  if (releasedIds.length == 0) {
    alert("There are too many nodes in this map. Please delete some.")
  }
  else {
    return releasedIds.shift()
  }
}

var createNode = function(label) {
  newId = getFreeId()
  nodeContents = {id:newId, label:label}
  nodes.add(nodeContents)
  return nodeContents
}

var addNode = function(nodeName) {
  if (nodes.length == 0) {
    defaultNode = createNode(nodeName)
  }
  else {
    selectedNodes = network.getSelectedNodes()
    if (selectedNodes.length == 0) {
      if (defaultNode == null) {
        alert("No node is selected and none can be inferred, please select the node to attach to.")
      } 
      else {
        newNode = createNode(nodeName)
        edges.add({from: defaultNode["id"], to:newNode["id"]})
      } 
    }
    else {
      newNode = createNode(nodeName)
      
      for(var i=0; i<selectedNodes.length; i++)
      {
        edges.add({from:selectedNodes[i], to:newNode["id"]})
      }
    }
  }

}

var updateRelatedWords = function(nodeName){
  $("#suggestions").html("")
  $(this).val("") // Clear text for the next node
  relatedWords = RELATED_THESAURUS[nodeName.toUpperCase()]
  suggestionString = ""
  
  if (relatedWords == null) {
    suggestionString += "<li><a>No suggestions were found...</a></li>"
  }
  else {
    for (var i=0; i < relatedWords.length; i++) {
      suggestionString += "<li><a class='suggWord'>"+Object.keys(relatedWords[i])[0].toLowerCase()+"</a></li>"
    }
  }

  $("#suggestions").html(suggestionString)
}

$(document).ready(function() {

  initGraph()
  initQueue()

  $.getJSON("../res/ea-thesaurus-master/ea-thesaurus.json", function(json) {
    RELATED_THESAURUS = json
    document.querySelector('#nodePopulator').addEventListener('keypress', function (e) {
      var key = e.which || e.keyCode;
      if (key === ENTER_KEY_CODE) { 
        var nodeName = $(this).val()
        addNode(nodeName)
        // Update suggested words
        updateRelatedWords(nodeName)

        // On a newly suggested word, add logic to update related words when selected
        $('#suggestions').on('click', '.suggWord', function() {
          nodeName = $($(this)[0]).text()
          addNode(nodeName)
        });
      }
    });
  });

  network.on('selectNode', function(info) {
    selectedNode = info['nodes'][0]
    selectedName = nodes.get(selectedNode)['label']
    updateRelatedWords(selectedName)
  })

});