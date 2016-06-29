function containsDataset(string, elements) {
  for(var i=0;i<elements.length;i++) {
    if (elements[i].dataset.repo == string) {
      return i;
    }
  }
  return null;
}

function addLabels(labels) {
  var string = "";
  for(var i=0;i<labels.length;i++) {
    if (labels[i].name.toLowerCase() == "bug") {
      string += '<div class="ui tiny red horizontal label">'+labels[i].name+'</div>';
    } else if (labels[i].name.toLowerCase() == "enhancement") {
      string += '<div class="ui tiny blue horizontal label">'+labels[i].name+'</div>';
    } else if (labels[i].name.toLowerCase() == "question") {
      string += '<div class="ui tiny pink horizontal label">'+labels[i].name+'</div>';
    } else {
      string += '<div class="ui tiny horizontal label">'+labels[i].name+'</div>';
    }
  }
  return string;
}

function addIssue (repo,issue) {
  var titleEl = document.createElement("div");
  titleEl.className = "title";
  titleEl.innerHTML = addLabels(issue.labels) + issue.title;

  var contentEl = document.createElement("div");
  contentEl.className = "content";
  contentEl.innerHTML = '<p>'+issue.body+'</p>';

  // just append issue to repository
  repo.lastChild.appendChild(titleEl);
  repo.lastChild.appendChild(contentEl);
}

function addRepo(name) {
  $("#repo_container").append('<div class="column" data-repo="'+name+'"><h3 class="ui header center aligned">'+name+'</h3><div class="ui styled fluid accordion"></div></div>');
}

function checkRepo (issue) {
  // use data-repo to store repo name
  repos = document.getElementById("repo_container").getElementsByClassName("column");

  if (repos === null || repos === undefined) {
    // repo results were null or undefined
    // no repos's found so just add a new repo
    addRepo(issue.repository.name);
    // and add this issue to it
    checkRepo(issue);
  } else if ( (match = containsDataset(issue.repository.name,repos) ) !== null ) {
    // found a matching repository that exists already
    if (repos[match].lastChild.children.length / 2 < issues_to_show) {
      addIssue(repos[match],issue);
    }
  } else {
    // found no matching repository, creating one
    addRepo(issue.repository.name);
    // and add this issue to it
    checkRepo(issue);
  }

}

function addTitle(username) {
  var  title = document.getElementById("title");
  title.textContent = "Overview of Issues for " + username;
}

function processResponse (response) {
  console.log(response);

  // TODO: find more reliable way of getting current username
  addTitle(response[0].user.login);

  for(var i=0;i<response.length;i++) {
      checkRepo(response[i]);
  }
  // run some semantic ui stuff to redetect any accordions
  $('.ui.accordion').accordion();
}

function sendRequest () {
  var username = document.getElementById("username").value;
  var password = document.getElementById("password").value;

  var auth = btoa(username + ":" + password);
  console.log("Auth Code to send: "+auth);

  // get some settings from the settings form
  issues_to_show = document.getElementById("issues_to_show").value || 5; // whatever value entered or the defualt of 5

  $.ajax({
    url: "https://api.github.com/issues?filter=subscribed",
    headers: { 'Authorization' : 'Basic ' + auth },
    // note that authentication only works with json and not jsonp in the case of the github api
    dataType : 'json',
    success: processResponse,
  });
}


function update () {
  console.log("Page update requested");
  document.getElementById("repo_container").innerHTML = "";
  sendRequest();
  $('.ui.sidebar').sidebar('hide');
  //alert("Updating");
}
