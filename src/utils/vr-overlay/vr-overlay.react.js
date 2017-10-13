import React, { PureComponent } from 'react';
//import Slider from 'material-ui/Slider';

import ProjectionDome from './projection-dome';
require('./sass/vr-overlay.sass');

export default class VROverlay extends PureComponent {

  constructor(props) {
    super(props);

    this.state = {
      vrZoom: 0,
    };
  }

  componentDidMount() {
    let passiveSupported = false;

    try {
      const options = Object.defineProperty({}, "passive", {
        get: function() {
          passiveSupported = true;
        }
      });

      window.addEventListener('test', null, options);
    } catch(err) {}

    this.refs.controlsOverlay.addEventListener('mousewheel', this._handleMouseScroll.bind(this), passiveSupported ? {passive: true} : false);
    this.refs.controlsOverlay.addEventListener('DOMMouseScroll', this._handleMouseScroll.bind(this), passiveSupported ? {passive: true} : false);

    window.addEventListener('resize', this.resizeProjectDome.bind(this));
  }

  componentWillUnmount() {
    this.refs.controlsOverlay.removeEventListener('mousewheel', this._handleMouseScroll.bind(this));
    this.refs.controlsOverlay.removeEventListener('DOMMouseScroll', this._handleMouseScroll.bind(this));

    window.removeEventListener('resize', this.resizeProjectDome.bind(this));

    this.p.destroy();
  }

  render() {
    return (
      <div className='vr-overlay'>
        <div ref='canvasContainer' className='vr-canvas-container' />
        { this.renderControls() }
      </div>
    );
  }

  renderControls() {
    const styles = {
      root: {
        display: 'flex',
        height: 124,
        flexDirection: 'row',
        justifyContent: 'space-around',
      },
    };

    return (
      <div
        ref='controlsOverlay'
        className='vr-controls'
        onMouseDown={this._handleMouseDown.bind(this)}
        onMouseUp={this._handleMouseUp.bind(this)}
        onMouseMove={this._handleMouseMove.bind(this)}
        onClick={this._handleMouseClick.bind(this)} >
        <div className='control-panel'>
          <div className='top'>
            <i className='zmdi zmdi-keyboard_arrow_up' onClick={this._moveVR.bind(this, 'up')} />
          </div>
          <div className='middle'>
            <i className='zmdi zmdi-chevron-left' onClick={this._moveVR.bind(this, 'left')} />
            <i className='zmdi zmdi-chevron-right' onClick={this._moveVR.bind(this, 'right')} />
          </div>
          <div className='bottom'>
            <i className='zmdi zmdi-keyboard_arrow_down' onClick={this._moveVR.bind(this, 'down')} />
          </div>
        </div>
        <div className='zoom-panel'>
          <div style={styles.root}>
            {/* <Slider style={{height: 100}} axis="y" defaultValue={this.state.vrZoom} value={this.state.vrZoom} onChange={this._handleSliderChange.bind(this)} /> */}
          </div>
        </div>
      </div>
    );
  }

  videoElementReady(videoElement) {
    const h = this.refs.canvasContainer.offsetHeight;

    this.p = new ProjectionDome( this.refs.canvasContainer, h * 16 / 9, h, videoElement, {
      inverseHPanning: true,
      inverseVPanning: true,
      speedX: 0.1,
      speedY: 0.1,
      mouseSensitivityX: 0.1,
      mouseSensitivityY: 0.1,
    });
  }

  resizeProjectDome() {
    const newHeight = this.refs.canvasContainer.offsetHeight;
    this.p.resize(newHeight * 16 / 9, newHeight)
  }

  _handleSliderChange(e, value) {
    this.setState({
      vrZoom: value,
    });

    this.p.setZoom(value);
  }

  _handleMouseClick(e) {
    if (this.mouseMoveFired) {
      this.mouseMoveFired = false;
      return;
    }

    if (!this.props.togglePausePlay) {
      return;
    }

    const classList = Array.prototype.slice.call(e.target.classList);
    if (classList.indexOf('zmdi') >= 0 || classList.indexOf('button') >= 0) {
      return;
    }

    this.props.togglePausePlay();
  }

  _handleMouseDown(e) {
    let isRightMB = false;
    if ('which' in e) { // Gecko (Firefox), WebKit (Safari/Chrome) & Opera
      isRightMB = e.which === 3;
    } else if ('button' in e) { // IE, Opera 
      isRightMB = e.button === 2;
    }

    if (isRightMB) {
      return;
    }

    this.mouseDown = true;

    this.p.onMouseDown(e);
  }

  _handleMouseUp(e) {
    this.mouseDown = false;

    this.p.onMouseUp(e);
  }

  _handleMouseScroll(e) {
    this.p.onMouseWheel(e);

    this.setState({
      vrZoom: this.p.getZoom(),
    });
  }

  _handleMouseMove(e) {
    if (!this.mouseDown) {
      return;
    }

    this.mouseMoveFired = true;
    this.p.onMouseMove(e);
  }

  _moveVR(direction) {
    const opt = { animated: true };

    switch(direction) {
      case 'up': {
        this.p.moveY(0.1, opt);
        break;
      }
      case 'right': {
        this.p.moveX(-0.1, opt);
        break;
      }
      case 'down': {
        this.p.moveY(-0.1, opt);
        break;
      }
      case 'left': {
        this.p.moveX(0.1, opt);
        break;
      }
    }
  }
}
