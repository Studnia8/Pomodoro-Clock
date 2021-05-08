import React from 'react';
import './MySessionClock.scss';
import accurateInterval from "accurate-interval";
import { FaCaretDown, FaCaretUp, FaPlay, FaPause, FaRedoAlt } from "react-icons/fa"

class TimeControl extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return ( 
            <div className = "sessionController" >
                <div className = "controllerName" > { this.props.controlName }
                </div>
                <button className = "buttonDown"
                    onClick = { this.props.onClick }
                    value = "-" >
                    <FaCaretDown / >
                </button>
                <div className = "controllerTitle" > { this.props.control }
                </div>
                <button className = "buttonUp"
                    onClick = { this.props.onClick }
                    value = "+" >
                    <FaCaretUp / >
                </button>
            </div>
        )
    }
}

class Timer extends React.Component {
    constructor(props) {
            super(props);
            this.state = {
                sessionBreak: 60,
                sessionLength: 300,
                sessionAlter: 0,
                countdownState: 'stop',
                clockType: "Session",
                time: 300,
                invervalID: '',
                timeColor: { color: "white" }
            };
            //binds
            this.setBrkTime = this.setBrkTime.bind(this);
            this.setSessTime = this.setSessTime.bind(this);
            this.setAltTime = this.setAltTime.bind(this);
            this.decreaseTime = this.decreaseTime.bind(this);
            this.lengthControl = this.lengthControl.bind(this);
            this.clockStateControl = this.clockStateControl.bind(this);
            this.launch = this.launch.bind(this);
            this.clockify = this.clockify.bind(this);
            this.clockSwitch = this.clockSwitch.bind(this);
            this.clockControl = this.clockControl.bind(this);
            this.reset = this.reset.bind(this);
        }
        //methods
    setBrkTime(e) {
        this.lengthControl('sessionBreak', e.currentTarget.value,
            this.state.sessionBreak, 'Session');
    }
    setSessTime(e) {
        this.lengthControl('sessionLength', e.currentTarget.value,
            this.state.sessionLength, 'Break');
    }
    setAltTime(e) {
        this.lengthControl('sessionAlter', e.currentTarget.value,
            this.state.sessionAlter, 'Session');
    }
    decreaseTime() {
        this.setState({
            time: this.state.time - 1
        })
    }
    lengthControl(stateToChange, sign, currentLength, clockType) {
        if (this.state.countdownState === 'running') return;
        if (this.state.clockType === clockType) {
            if (sign === "-" && currentLength !== 0) {
                this.setState({
                    [stateToChange]: currentLength - 15 });
            } else if (sign === "+" && currentLength !== 90) {
                this.setState({
                    [stateToChange]: currentLength + 15 });
            }
        } else {
            if (sign === "-" && currentLength !== 30) {
                this.setState({
                    [stateToChange]: currentLength - 15,
                    time: currentLength - 15
                });
            } else if (sign === "+" && currentLength !== 1800) {
                this.setState({
                    [stateToChange]: currentLength + 15,
                    time: currentLength + 15
                });
            }
        }
    }
    clockStateControl() {
        let clockState = this.state.countdownState === 'stop' ? (
            this.launch(),
            this.setState({ countdownState: 'running' })
        ) : (
            this.setState({ countdownState: 'stop' }),
            this.state.intervalID.clear()
        );
    }
    launch() {
        this.setState({
            countdownState: 'running',
            intervalID: accurateInterval(() => {
                this.decreaseTime();
                this.clockControl()
            }, 1000)
        })
    }
    clockify(state) {
        let minutes = Math.floor(state / 60);
        let seconds = state - minutes * 60;
        seconds = seconds < 10 ? '0' + seconds : seconds;
        minutes = minutes < 10 ? '0' + minutes : minutes;
        return minutes + ':' + seconds;
    }
    clockSwitch(num, str) {
        this.setState({
            time: num,
            clockType: str,
            timeColor: { color: 'white' }
        })
    }
    clockControl() {
        let clocktime = this.state.time;
        this.warning(clocktime);
        //this.alarm(clocktime);
        if (clocktime < 0) {
            if (this.state.clockType === 'Session') {
                this.clockSwitch(this.state.sessionBreak, 'Break')
            } else {
                this.clockSwitch(this.state.sessionLength, 'Session');
                this.alarmSound.pause();
                this.alarmSound.currentTime = 0;
                if (this.state.sessionLength > this.state.sessionAlter) {
                    this.setState({
                        sessionLength: this.state.sessionLength - this.state.sessionAlter,
                        time: this.state.time - this.state.sessionAlter
                    })
                } else {
                    this.setState({
                        time: 0
                    });
                    this.state.intervalID.clear()
                }
            };
        }
    }
    warning() {
        this.state.time < 11 ?
            this.setState({
                timeColor: { color: "red" }
            }) :
            this.setState({
                timeColor: { color: "white" }
            })
    }
    alarm() {
        if (this.state.time === 0) {
            //this.alarmSound.play()
        }
    }
    reset() {
        this.setState({
            sessionBreak: 60,
            sessionLength: 300,
            sessionAlter: 0,
            countdownState: 'stop',
            clockType: "Session",
            time: 300,
            invervalID: '',
            timeColor: { color: "white" }
        });
        this.alarmSound.pause();
        this.alarmSound.currentTime = 0;
        this.state.intervalID.clear();
    }
    render() {
        return ( <div className = "app" >
            <div className = "appName" >
                Session Clock
            </div>
            <div className = "controllers" >
                <TimeControl controlName = "Break Length"
                onClick = { this.setBrkTime }
                control = { this.clockify(this.state.sessionBreak) }
                />
                <TimeControl controlName = "Current Session Length"
                onClick = { this.setSessTime }
                control = { this.clockify(this.state.sessionLength) }
                />
                <TimeControl controlName = "Change on next session"
                onClick = { this.setAltTime }
                control = { this.clockify(this.state.sessionAlter) }
                />
            </div>
            <div id = "mainClock" >
                <div >
                    <div className = "clockTitle" > { this.state.clockType }
                    </div>
                </div>
            <div className = "countdown"
                style = { this.state.timeColor } > { this.clockify(this.state.time) }
            </div>
        </div>
        <div id = "mainClockControl" >
            <FaPlay className = "buttonControl"
                id = "play"
                onClick = { this.launch }
            />
            <FaPause className = "buttonControl"
                id = "pause"
                onClick = { this.clockStateControl }
            />
            <FaRedoAlt className = "buttonControl"
                id = "reset"
                onClick = { this.reset }
            />
            </div>
            <div className = "madeby" > Made by < a className = "madeLink"
                title = "Go to Github!"
                target = "_blank"
                rel = "noopener noreferrer"
                href = "https://github.com/Studnia8" > Michał Studnicki </a>
            </div>
            <audio id = "alarm"
                preload = "auto"
                src = "https://www.soundsnap.com/old_alarm_clock_ring_2_wav"
                ref = {(audio) => { this.alarmSound = audio; } }
            />
            </div>
        )
    }
}

export default Timer;