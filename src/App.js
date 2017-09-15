import React, { Component } from 'react';
import './styles/App.css';

import CloudAPI from './utils/api.js'
import Player from './Player.js';
import Camera from './Camera.js';
import moment from 'moment';
import Cookie from 'js-cookie';
import classNames from 'classnames';

export default class extends Component {

  constructor(props) {
    super(props);

    this.state = {
      event: {
        title: '.',
        subtitle: '.',
        startTime: '',
        endTime: '',
        details: {
          description: '.',
        },
        fakeCameras: [],
        shares: [],
        cameras: [],
      },
      playingIndex: 0,
      dataReady: false,
      playingUrl: '',
    };
  }

  componentDidMount() {
    const { search } = this.props.location;
    const token = search.split('token=')[1];


    CloudAPI.parseToken(token).then(res => {
      if (res.err) {
        this.setState({
          err: true,
        });

        return
      }

      if (res.cookies) {
        res.cookies.forEach(cookie => {
          Cookie.set(cookie.name, cookie.value, {domain: '.solinkshare.io', path: `/${res.info.tenantId}/shares/${res.info.eventId}/`});
        });
      }

      let url = '';
      res.event.cameras.forEach((camera, idx) => {
        url = CloudAPI.getPlaylist(camera) || '';

        if (url.length > 0 && this.state.playingUrl.length === 0) {
          this.setState({
            playingUrl: url,
          });
        }
      });

      this.setState({
        info: res.info,
        event: res.event,
        showCamList: res.event.cameras.length > 1,
        dataReady: true,
      });

      if (res.event.pushToCloudStatus === 'inProgress') {
        this._pollEvent(5000);
        this.setState({
          inProgress: true,
          bannerMessage: 'The event is being updated...',
        });
      }
    })
  }

  render() {
    const appClass = classNames(
      'App',
      {
        'fake': !this.state.dataReady,
        'data-ready': this.state.dataReady,
      }
    );

    const infoContainerClass = classNames(
      'info-container',
      {
        show: this.state.showCamList,
      }
    );

    const appIntroClass = classNames(
      'App-intro',
      {
        show: this.state.showCamList,
      }
    );

    const appBodayClass = classNames(
      'app-body',
      {
        single: this.state.event.cameras.length === 1,
      }
    );

    const cameraPanelClass = classNames(
      'cameras-panel',
      {
        single: this.state.event.cameras.length === 1,
      }
    );

    const inProgressBannerClass = classNames(
      'banner',
      {
        active: this.state.inProgress,
      }
    );

    const start = `${moment(this.state.event.startTime).format('HH:mm:ss')}`;
    const end = `${moment(this.state.event.endTime).format('HH:mm:ss')}`;

    const locationName = this.state.event.subtitle.split(' @ ')[1];
    return (
      <div className={appClass}>
        <div className='container'>
          <div className='App-header'>
            <div className='inner-wrap'>
              <img alt='' src={process.env.PUBLIC_URL + '/solink.png'} />
              {
                this.state.info &&
                <div className='account'>
                  <i className='zmdi zmdi-account' />
                  {this.state.info.sharedTo}
                </div>  
              }
              
            </div>
          </div>
          <div className={appBodayClass}>
            {
              this.state.err &&
              <div className='error-mask'>
                <span className='text'>The requested resouce is unavailable</span>
              </div>
            }
            <div className={inProgressBannerClass}>{this.state.bannerMessage}</div>
            {
              this.state.dataReady &&
              <Player url={this.state.playingUrl}  />
            }
            {
              !this.state.dataReady &&
              <div className='player-fake'>
                <img alt='' src={process.env.PUBLIC_URL + '/svg/loading-spokes.svg'} />
              </div>
            }
          </div>

          <div className={infoContainerClass}>
            <div className={appIntroClass}>
              {
                this.state.event.cameras.length > 0 && this.state.dataReady &&
                <div className={cameraPanelClass}>
                  <div className='cameras'>
                  {
                    this.state.event.cameras.map((camera, idx) => {
                      return (
                        <Camera
                          key={camera.id}
                          camera={camera}
                          active={idx === this.state.playingIndex && this.state.playingUrl.length > 0}
                          index={idx}
                          singleton={this.state.event.cameras.length === 1}
                          onCameraChange={this._handleCameraChange.bind(this)} />
                      )
                    })
                  }
                  </div>
                  {
                    this.state.event.cameras.length > 1 &&  
                    <div className='handle' onClick={this._toggleShowCamList.bind(this)}>
                      <i className='zmdi zmdi-keyboard_arrow_down' />
                    </div>
                    
                  }
                </div>
              }
              {
                !this.state.dataReady &&
                <div className='cameras-panel'>
                  <div className='cameras'>
                    <Camera camera={{}}/>
                    <Camera camera={{}}/>
                  </div>
                </div>
              }
              
            </div>
            <div className='App-details'>
              <div className='left'>
                <div className='title'>
                  {
                    this.state.event.type === 'motion' &&
                    <span>{`Shared motion clip`}</span>
                  }
                  {
                    this.state.event.type !== 'motion' &&
                    <span>{this.state.event.title}</span>
                  }
                </div>
              </div>
              {
                this.state.dataReady &&
                <div className='right'>
                  <div className='entry'>
                    <i className='zmdi zmdi-calendar'/> 
                    <div>{moment(this.state.event.startTime).format('MMM Do, YYYY')}</div>
                  </div>
                  <div className='entry'>
                    <i className='zmdi zmdi-schedule'/> 
                    <div>{start} - {end}</div>
                  </div>
                  <div className='entry'>
                    <i className='zmdi zmdi-zmdi-pin' />
                    <div>{locationName}</div>
                  </div>
                </div>
              }
              {
                !this.state.dataReady &&
                <div className='right'>
                  <div className='right-fake'/>
                </div>
              }
              <div className='description'>
                {this.state.event.details.description}
              </div>
            </div>
            {
              this.state.dataReady && this.state.event.type === 'transaction' &&
              <div className='App-details'>
                <div className='receipt'>
                  <pre>
                    {this.state.event.details.receipt}
                  </pre>
                </div>
              </div>
            }
          </div>
        </div>
      </div>
    );
  }

  _pollEvent(interval) {
    const { search } = this.props.location;
    const token = search.split('token=')[1];

    this.polling = setInterval(() => {

      CloudAPI.parseToken(token, true).then(res => {

        console.debug(res.event.pushToCloudStatus);

        if (res.event.pushToCloudStatus !== 'inProgress') {
          clearInterval(this.polling);

          this._handleCameraChange(this.state.playingIndex);

          this.setState({
            info: res.info,
            event: res.event,
            inProgress: false,
            bannerMessage: null,
            dataReady: false,
          });

          setTimeout(() => {
            this.setState({
              dataReady: true
            }, 10)
          })
        }
      })
    }, interval);
  }

  _toggleShowCamList() {
    this.setState({
      showCamList: !this.state.showCamList,
    });
  }

  _handleCameraChange(index) {
    const url = CloudAPI.getPlaylist(this.state.event.cameras[index]);

    this.setState({
      playingIndex: index,
      playingUrl: url || '',
    });
  }
}


