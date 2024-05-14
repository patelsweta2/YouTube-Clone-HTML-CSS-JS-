const API_KEY = "AIzaSyBNvXqypkijI2-LbTZSM4QxXkEYE8njJ00";
const baseUrl = "https://www.googleapis.com/youtube/v3";

async function fetchVideo(searchQuery, maxResult) {
  try {
    const url =
      baseUrl +
      "/search" +
      `?key=${API_KEY}` +
      `&part=snippet` +
      `&q=${searchQuery}` +
      `&maxResults=${maxResult}`;
    const response = await fetch(url);
    const data = await response.json();
    console.log(data);
    renderVideos(data);
  } catch (error) {
    console.error(error);
  }
}
fetchVideo("", 50);
// fetchVideo("latest videos", 50);
// fetchVideo("latest videos", 50);

async function fetchLogo(channelId) {
  const url = `${baseUrl}/channels?part=snippet&id=${channelId}&key=${API_KEY}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    const logo = data.items[0].snippet.thumbnails.default.url;
    return logo;
  } catch (error) {
    console.error("Error fetching channel dp:", error);
    return null;
  }
}
const videosDiv = document.querySelector(".videos");

const today = new Date();
function getDate(videoDate) {
  videoDate = new Date(videoDate.split("T")[0]); // YYYY-MM-DD
  const differenceInMilliseconds = today.getTime() - videoDate.getTime();
  const days = differenceInMilliseconds / (1000 * 60 * 60 * 24);
  const months = days / 30;
  const hours = days / 24;
  const minute = hours / 60;
  const years = days / 365;
  if (years >= 1) {
    let year = Math.floor(years);
    return year == 1 ? year + " year ago" : year + " years ago";
  }
  if (months >= 1) {
    let month = Math.floor(months);
    return month == 1 ? month + " month ago" : month + " months ago";
  }
  if (days >= 1) {
    let day = Math.floor(days);
    return day == 1 ? day + " day ago" : day + " days ago";
  }
  let min = Math.ceil(minute);
  return min == 1 ? min + " minute ago" : year + " minutes ago";
}
function renderVideos(data) {
  videosDiv.innerHTML = "";
  const { items } = data; //array of video object
  console.log(items);
  items.forEach(async (item) => {
    const { videoId } = item.id; //undefined for youtube channel
    console.log(videoId);
    const { snippet } = item;
    const {
      title,
      channelTitle,
      channelId,
      description,
      liveBroadcastContent,
      publishTime,
      thumbnails,
    } = snippet;
    let imageUrl = thumbnails.high.url;
    let profilePic = await fetchLogo(channelId);
    let date = getDate(publishTime);
    let contentDetails, statistics, time, view;
    if (videoId) {
      contentDetails = await fetchVideoStats(videoId, "contentDetails");
      statistics = await fetchVideoStats(videoId, "statistics");
      // console.log('contentDetails',contentDetails);
      contentDetails = contentDetails.items[0].contentDetails; //"cS28Dv2XfXo"
      statistics = statistics.items[0].statistics;
      let { duration } = contentDetails;
      let { viewCount } = statistics;
      view = formatViews(viewCount);
      time = formatDuration(duration);
    }
    let videoDiv = document.createElement("div");
    videoDiv.innerHTML = `
                  <div class="thumbnail">
                      <img src="${imageUrl}" alt="loading..." class="thumbnailImg">
                      <div class="${videoId ? "duration" : ""}"> ${
      videoId ? time : ""
    }</div>
                  </div>
                  <div class="details">
                      <div style="padding:5px;">
                          <div class="profile"><img src="${profilePic}" alt="${
      channelTitle[0]
    }" class="thumbnailImg"></div>
                          </div>
                          <div class="videoDetails">
                          <p class="titleText">${title}</p>
                          <p class="channelName">${channelTitle}</p>
                          <p class="${videoId ? "time" : ""}">${
      videoId ? view + " views  &#x2022; " + date : ""
    }</p>
                      </div>
                  </div>
          `;
    videoDiv.classList.add("video");
    videosDiv.append(videoDiv);
    addEventListener(videoDiv, videoId);
  });
}
// renderVideos(data);
async function fetchVideoStats(videoId, typeOfDetails) {
  try {
    const response = await fetch(
      baseUrl +
        `/videos` +
        `?key=${API_KEY}` +
        `&part=${typeOfDetails}` +
        `&id=${videoId}`
    );
    const data = await response.json();
    console.log(data);
    if (typeOfDetails === "contentDetails")
      console.log(
        typeOfDetails + " inside stats func" + data.items,
        data.items[0].contentDetails
      );
    else
      console.log(
        typeOfDetails + " inside stats func" + data.items,
        data.items[0].statistics
      );
    return data;
  } catch (error) {
    console.log(videoId);
    console.error(error);
  }
}
// fetchVideoStats("cS28Dv2XfXo", "contentDetails");
// fetchVideoStats("o7X82vwBAbw", "statistics");
const videoId = "eILUmCJhl64";

// fetchComments(videoId);

function formatViews(viewCount) {
  let count = "";
  if (viewCount >= 1000000000) {
    count = (viewCount / 1000000000).toFixed(1);
    if (count.endsWith(".0")) count = count.slice(0, -2);
    return count + "B";
  } else if (viewCount >= 1000000) {
    count = (viewCount / 1000000).toFixed(1);
    //  if(count.endsWith('.00'))count = count.slice(0, -3);
    if (count.endsWith(".0")) count = count.slice(0, -2);
    return count + "M";
  } else if (viewCount >= 10000) {
    count = Math.floor(viewCount / 1000);
    return count + "K";
  } else if (viewCount >= 1000) {
    count = (viewCount / 1000).toFixed(1);
    if (count.endsWith(".0")) count = count.slice(0, -2);
    return count + "K";
  } else {
    return viewCount;
  }
}
function formatDuration(duration) {
  //PT1M19S
  let hour = "";
  let min = "";
  let sec = "";
  if (duration.includes("D")) {
    return "24:00:00";
  }
  let hourIdx = duration.indexOf("H");
  let minIdx = duration.indexOf("M");
  let secIdx = duration.indexOf("S");
  if (hourIdx === -1 && minIdx === -1) {
    // in seconds PT58S
    sec = duration.slice(2, -1);
    if (sec.length == 1) sec = "0" + sec;
    return "0:" + sec;
  } else if (hourIdx === -1) {
    //in minutes PT2M3S
    min = duration.slice(2, minIdx);
    if (secIdx == -1) {
      //PT3M
      sec = "00";
    } else {
      sec = duration.slice(minIdx + 1, -1);
      if (sec.length == 1) sec = "0" + sec;
    }
    return min + ":" + sec;
  } else {
    //in hours 10:03:45 PT10H3M45S
    hour = duration.slice(2, hourIdx);
    if (minIdx === -1 && secIdx === -1) {
      //PT1H
      return hour + ":00" + ":00";
    }
    if (secIdx == -1) {
      //PT1H30M
      min = duration.slice(hourIdx + 1, minIdx);
      if (min.length == 1) min = "0" + min;
      return hour + ":" + min;
    }
    if (minIdx == -1) {
      //PT1H3S
      sec = duration.slice(hourIdx + 1, -1);
      if (sec.length == 1) sec = "0" + sec;
      return hour + ":" + "00" + ":" + sec;
    } else {
      min = duration.slice(hourIdx + 1, minIdx);
      if (min.length == 1) min = "0" + min;
      sec = duration.slice(minIdx + 1, -1);
      if (sec.length == 1) sec = "0" + sec;
      return hour + ":" + min + ":" + sec;
    }
  }
}

let searchInput = document.querySelector(".search-input");
searchInput.addEventListener("change", (e) => {
  e.preventDefault();
  let value = searchInput.value;
  console.log("search clicked", value);
  fetchVideo(value, 50);
});
function addEventListener(video, videoId) {
  video.addEventListener("click", (e) => {
    console.log(e.target);
    console.log(videoId);
    window.location.href = `videoPlayer.html?videoId=${videoId}`;
  });
}
