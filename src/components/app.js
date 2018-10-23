
import React, { Component } from "react";
import moment from "moment";
import spinner from "../images/spinner.svg";
import { GOOGLE_API_KEY, CALENDAR_ID } from "../config.js";

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      time: moment().format("dd, Do MMMM, h:mm A"),
      events: [],
      isLoading: true
    };
  }

  componentDidMount = () => {
    this.getEvents();
    setInterval(() => {
      this.tick();
    }, 1000);
    setInterval(() => {
      this.getEvents();
    }, 60000);
  };
//action (mapDispatchToprops)
  getEvents() {
    let that = this;
    function start() {
      window.gapi.client
        .init({
          apiKey: GOOGLE_API_KEY
        })
        .then(function () {
          return window.gapi.client.request({
            path: `https://www.googleapis.com/calendar/v3/calendars/${CALENDAR_ID}/events?maxResults=11&orderBy=updated&timeMin=${moment().toISOString()}&timeMax=${moment()
              .endOf("day")
              .toISOString()}`
          });
        })
        .then(
          response => {
            let events = response.result.items;
            let sortedEvents = events.sort(function (a, b) {
              return (
                moment(b.start.dateTime).format("YYYYMMDD") -
                moment(a.start.dateTime).format("YYYYMMDD")
              );
            });
            if (events.length > 0) {
              that.setState(
                {
                  events: sortedEvents,
                  isLoading: false,
                },
              );
            } else {
              that.setState({
                isLoading: false
              });
            }
          },
          function (reason) {
            console.log(reason);
          }
        );
    }
    window.gapi.load("client", start);
  }
//action (mapStateToProps)
  tick = () => {
    let time = moment().format("dddd, Do MMMM, h:mm A");
    this.setState({
      time: time
    });
  };

  render() {
    const { time, events } = this.state;

    let eventsList = events.map(function (event) {
      return (
        <a
          className="list-group-item"
          href={event.htmlLink}
          target="_blank"
          key={event.id}
        >
          {event.summary}{" "}
          <span className="badge">
            {moment(event.start.dateTime).format("h:mm a")},{" "}
            {moment(event.end.dateTime).diff(
              moment(event.start.dateTime),
              "minutes"
            )}{" "}
            minutes, {moment(event.start.dateTime).format("MMMM Do")}{" "}
          </span>
          <br /><br />
        </a>
      );
    });

    let loadingState = (
      <div className="loading">
        <img src={spinner} alt="Loading..." />
      </div>
    );

    return (
      <div className="container">
        <div className="current-time">{time}, 2018</div>
        <h1>Upcoming Meetings</h1>
        <div className="list-group">
          {this.state.isLoading && loadingState}
          {events.length > 0 && eventsList}
        </div>
        <a
          className="primary-cta"
          href="https://calendar.google.com/calendar?cid=c3FtMnVkaTFhZGY2ZHM3Z2o5aDgxdHVldDhAZ3JvdXAuY2FsZW5kYXIuZ29vZ2xlLmNvbQ"
          target="_blank"
        >
          <button>+</button>
        </a>
      </div>
    );
  }
}


