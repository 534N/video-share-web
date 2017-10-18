try {    
    var THREE = require('three');
} catch(err) {
    console.warn(err);
}

function ProjectionDome( parentEl, w, h, videoEl, options ) {

    this._video = videoEl;

    this.options = options || {};

    this.R = 1000;

    this._uniforms = {};
    this.init();
    this.createMediaPlayer(parentEl, w, h);
}

ProjectionDome.defaults = {
    zoom:             1,
    fov:              30,
    fovMin:           3,
    fovMax:           500,
    lon:              80,
    lat:              30,
    loop:             "loop",

    inverseHPanning:  false,
    inverseVPanning:  false,

    mouseSensitivityX: 1,
    mouseSensitivityY: 1,

    speedX: 0.3,  // animation speed
    speedY: 0.3   
};

ProjectionDome.prototype = {

    init: function() {
        this._time = new Date().getTime();
        this._controls = {};

        this.flatProjection = true;

        this._cam_z = {
            max: 90,
            min: -120
        };

        this._lonLatConstraints = {
            lon: {
                min: -180,
                max: 180
            },
            lat: {
                min: 0,
                max: 75
            }
        };

        this._requestAnimationId = ''; // used to cancel requestAnimationFrame on destroy
        this._mouseDown = false;
        this._dragStart = {};

        this._lat = ProjectionDome.defaults.lat;
        this._lon = ProjectionDome.defaults.lon;
        this._fov = ProjectionDome.defaults.fov;
        this.zoom = this._cam_z.max;

        this._inverseHPanning = this.options.inverseHPanning || ProjectionDome.defaults.inverseHPanning;
        this._inverseVPanning = this.options.inverseVPanning || ProjectionDome.defaults.inverseVPanning;

        // initial position options
        if (!isNaN(this.options.x) && this.options.x >= 0 && this.options.x <= 1) {
            this._lon = this._lonLatConstraints.lon.min + this.options.x * ( this._lonLatConstraints.lon.max - this._lonLatConstraints.lon.min );
        }
        if (!isNaN(this.options.y) && this.options.y >= 0 && this.options.y <= 1) {
            this._lat = this._lonLatConstraints.lat.min + this.options.y * ( this._lonLatConstraints.lat.max - this._lonLatConstraints.lat.min );
        }

        // initial zoom option
        if (this.options.zoom && this.options.zoom >= 0 && this.options.zoom <= 1) {
            this.zoom = this._cam_z.min + (1-this.options.zoom) * ( this._cam_z.max - this._cam_z.min );
        }
    
        this._target_lat = this._lat;
        this._target_lon = this._lon;

        this._target_zoom = this.zoom;

        this._speedX = this.options.speedX || ProjectionDome.defaults.speedX;
        this._speedY = this.options.speedY || ProjectionDome.defaults.speedY;

        this._mouseSensitivityX = this.options.mouseSensitivityX || ProjectionDome.defaults.mouseSensitivityX;
        this._mouseSensitivityY = this.options.mouseSensitivityY || ProjectionDome.defaults.mouseSensitivityY;
    },

    createMediaPlayer: function(parentEl, w, h) {


        // make a self reference we can pass to our callbacks
        var self = this;

        // create a local THREE.js scene
        this._scene = new THREE.Scene();

        // create ThreeJS camera
        var elRatio = w / h;
        this._camera = new THREE.PerspectiveCamera(this._fov, elRatio, 1, 2*this.R);
        this._camera.setFocalLength(this._fov);

        // create ThreeJS renderer and append it to our object
        this._renderer = ProjectionDome.WebGLDetector.webgl? new THREE.WebGLRenderer(): new THREE.CanvasRenderer();
        this._renderer.setSize( w, h );
        this._renderer.autoClear = false;
        this._renderer.setClearColor( 0x333333, 1 );

        // append the rendering element to this div
        parentEl.appendChild(this._renderer.domElement);

        var createAnimation = function () {
            self._texture.generateMipmaps = false;
            self._texture.minFilter = THREE.LinearFilter;
            self._texture.magFilter = THREE.LinearFilter;
            self._texture.format = THREE.RGBFormat;

            // create ThreeJS mesh sphere onto which our texture will be drawn
            //
            var geometry = new THREE.SphereGeometry( self.R, 60, 50, 0, 2*Math.PI, 0, Math.PI );

            var faceVertexUvs = geometry.faceVertexUvs[ 0 ];
            for ( var i = 0; i < faceVertexUvs.length; i ++ ) {

                var uvs = faceVertexUvs[ i ];
                var face = geometry.faces[ i ];

                for ( var j = 0; j < 3; j ++ ) {

                    uvs[ j ].x = face.vertexNormals[ j ].x * 0.5 + 0.5;
                    uvs[ j ].y = face.vertexNormals[ j ].y * 0.5 + 0.5;

                }
            }

            self._video.onloadeddata = function(d) {

                self._ratio = self._video.videoHeight / self._video.videoWidth;

                self._uniforms = {
                    iGlobalTime:  { type:  'f', value:  0.1 },
                    iChannel0:    { type:  't', value:  self._texture },
                    ratio:        { type:  'f', value:  self._ratio }
                };

                // if reloading video, remove old mesh
                if (self._mesh) {
                    self._scene.remove( self._mesh );
                }

                self._mesh = new THREE.Mesh( geometry, 

                    new THREE.ShaderMaterial({
                        fragmentShader:  ProjectionDome.fragmentShader2,
                        vertexShader:    ProjectionDome.vertexShader,
                        uniforms:        self._uniforms,
                    // wireframe:        true
                    })

                    // for tests only, draw wireframe
                    // new THREE.MeshBasicMaterial({ 
                    //     wireframe: true
                    // })
                );

                // mirror the texture, since we're looking from the inside out
                self._mesh.scale.x = -1;                 
                
                self._scene.add(self._mesh);
                self.animate();
            };

        };

        this._texture = new THREE.Texture( this._video );
        createAnimation();
    },

    onMouseMove: function(event) {
        if(this._mouseDown) {
            var signX = this._inverseHPanning ? 1 : -1,
            signY = this._inverseVPanning ? 1 : -1;

            var x, y;

            x = event.pageX - this._dragStart.x;
            y = event.pageY - this._dragStart.y;
            console.debug('x', x)
            console.debug('y', y)
            this._dragStart.x = event.pageX;
            this._dragStart.y = event.pageY;

            this._target_lon = this._target_lon + this._mouseSensitivityX * signX * x;  
            this._target_lat = this._target_lat + this._mouseSensitivityY * signY * y;

            console.debug('event', event)
            console.debug('this._dragStart.x', this._dragStart.x)
            console.debug('this._dragStart.y', this._dragStart.y)
            console.debug('this._target_lon', this._target_lon)
            console.debug('this._target_lat', this._target_lat)
            
        }
    },

    onMouseWheel: function(event) {

        var wheelSpeed = -0.01;

        // WebKit
        if ( event.wheelDeltaY ) {
            this._fov -= event.wheelDeltaY * wheelSpeed;
            this._target_zoom = this.zoom -= event.wheelDeltaY * wheelSpeed;
            // Opera / Explorer 9
        } else if ( event.wheelDelta ) {
            this._fov -= event.wheelDelta * wheelSpeed;
            this._target_zoom = this.zoom -= event.wheelDelta * wheelSpeed;
            // Firefox
        } else if ( event.detail ) {
            this._fov += event.detail * 1.0;
            this._target_zoom = this.zoom += event.detail * 1.0;
        }

        if(this._fov < ProjectionDome.defaults.fovMin) {
            this._fov = ProjectionDome.defaults.fovMin;
        } else if(this._fov > ProjectionDome.defaults.fovMax) {
            this._fov = ProjectionDome.defaults.fovMax;
        }

        if (this.zoom > this._cam_z.max) { this.zoom = this._cam_z.max; }
        if (this.zoom < this._cam_z.min) { this.zoom = this._cam_z.min; }
        // console.log( 'zoom: ' + this.zoom );

        event.preventDefault();
    },

    onMouseDown: function(event) {
        this._mouseDown = true;
        this._dragStart.x = event.pageX;
        this._dragStart.y = event.pageY;
    },

    onMouseUp: function(event) {
        this._mouseDown = false;
    },

    animate: function() {
        
        // set our animate function to fire next time a frame is ready
        this._requestAnimationId = requestAnimationFrame( this.animate.bind(this) );

        if ( this._video.readyState === this._video.HAVE_ENOUGH_DATA) {

            if (!this._texture) { return; }

            var ct = new Date().getTime();
            if(ct - this._time >= 30) {
                this._texture.needsUpdate = true;
                this._time = ct;
            }
        }

        this.render();
    },

    render: function() {

        this._lat = ( 1 - this._speedX ) * this._lat + this._speedX * this._target_lat;
        this._lon = ( 1 - this._speedY ) * this._lon + this._speedY * this._target_lon;

        this.zoom = 0.7*this.zoom + 0.3*this._target_zoom;

        this._lat = Math.max( - 75, Math.min( 75, this._lat ) );

        if (this._lat < 0) { this._lat = 0; }

        this._phi = ( 90 - this._lat ) * Math.PI / 180;
        this._theta = this._lon * Math.PI / 180;

        // var cx = R * Math.sin( this._phi ) * Math.cos( this._theta );
        // var cy = R * Math.cos( this._phi );
        // var cz = R * Math.sin( this._phi ) * Math.sin( this._theta );

        var cx = 0;
        var cy = 2 * this.R * Math.cos( this._phi );
        var cz = 2 * this.R * Math.sin( this._phi );

        this._camera.lookAt(new THREE.Vector3(cx, cy, cz));

        if (this.flatProjection) {
            this._camera.position.x = 0;
            this._camera.position.y = 0;
            this._camera.position.z = this.R/3;
        } else {
            this._camera.position.x = - cx;
            this._camera.position.y = - cy;
            this._camera.position.z = - cz;
        }

        this._camera.translateZ( 5*this.zoom );

        this._mesh.rotation.z = this._theta;

        this._renderer.clear();
        this._renderer.render( this._scene, this._camera );

        this._uniforms.ratio.value = this._ratio;

        if ( this._capture && typeof(this._capture) === 'function') {
            var imgUrl = this._renderer.domElement.toDataURL('image/png');
            this._capture(imgUrl);
            this._capture = null;
        }
    },

    resize: function(w, h) {
        this._renderer.setSize(w, h);
        this._camera.aspect = w / h;
        this._camera.updateProjectionMatrix();
    },

    getZoom: function () {
        var camZDelta = this._cam_z.max - this._cam_z.min;

        var z = 1 - (this.zoom - this._cam_z.min) / camZDelta;

        z = z < 0 ? 0 : z;
        z = z > 1 ? 1 : z;

        return z;
    },

    getPosition: function() {
       var lonDelta = this._lonLatConstraints.lon.max - this._lonLatConstraints.lon.min;
       var latDelta = this._lonLatConstraints.lat.max - this._lonLatConstraints.lat.min;

       var r = this._lon % 360;

       if (r < -180) {
           r += 360;
       } else if (r > 180) {
           r -= 360;
       }

       return {
           x: ( r - this._lonLatConstraints.lon.min) / lonDelta,
           y: (this._lat - this._lonLatConstraints.lat.min) / latDelta
       };
    },

    setPosition: function(x, y, opts) {
        
        if( !isNaN(x) ) { this.setX( x, opts ); }
        if( !isNaN(y) ) { this.setY( y, opts ); }
    },


    setAnimationSpeed: function( opts ) {

        if ( !isNaN(opts.x) ) { this._speedX = opts.x; }
        if ( !isNaN(opts.y) ) { this._speedY = opts.y; }
    },


    setMouseSensitivity: function( opts ) {

        if ( !isNaN(opts.x) ) { this._mouseSensitivityX = opts.x; }
        if ( !isNaN(opts.y) ) { this._mouseSensitivityY = opts.y; }
    },


    setZoom: function(z, opts) {

        opts = opts || {};

        if (isNaN(z) || z < 0 || z > 1) {
            return console.error('[ProjectionDome.setZ]  invalid param');
        }


        var newZoom = this._cam_z.min + (1-z) * ( this._cam_z.max - this._cam_z.min );

        if (opts.animated) {
            this._target_zoom = newZoom;
        } else {
            this._target_zoom = this.zoom = newZoom;
        }
    },

    setX: function(x, opts) {
        
        opts = opts || {};

        if (isNaN(x) || x < 0 || x > 1) {
            return console.error('[ProjectionDome.setX]  invalid param');
        }

        var newLon = this._lonLatConstraints.lon.min + x * ( this._lonLatConstraints.lon.max - this._lonLatConstraints.lon.min );

        if (opts.animated) {
            this._target_lon = newLon;
        } else {
            this._target_lon = this._lon = newLon;
        }
    },

    setY: function(y, opts) {

        opts = opts || {};

        if (isNaN(y) || y < 0 || y > 1) {
            return console.error('[ProjectionDome.setY]  invalid param');
        }

        var newLat = this._lonLatConstraints.lat.min + y * ( this._lonLatConstraints.lat.max - this._lonLatConstraints.lat.min );

        if (opts.animated) {
            this._target_lat = newLat;
        } else {
            this._target_lat = this._lat = newLat;
        }
    },


    moveX: function(dx, opts) {
        
        opts = opts || {};

        var newLon = this._lon + dx * ( this._lonLatConstraints.lon.max - this._lonLatConstraints.lon.min );

        if (opts.animated) {
            this._target_lon = newLon;
        } else {
            this._target_lon = this._lon = newLon;
        }
    },


    moveY: function(dy, opts) {

        opts = opts || {};

        var newLat = this._lat + dy * ( this._lonLatConstraints.lat.max - this._lonLatConstraints.lat.min );
        newLat = newLat < this._lonLatConstraints.lat.min ? this._lonLatConstraints.lat.min : newLat;
        newLat = newLat > this._lonLatConstraints.lat.max ? this._lonLatConstraints.lat.max : newLat;

        if (opts.animated) {
            this._target_lat = newLat;
        } else {
            this._target_lat = this._lat = newLat;
        }
    },


    getImageUrl: function( cb ) {

        cb = cb || function(){};

        this._capture = function(d) {
            cb(d);
        };
    },

    destroy: function(cb) {
        window.cancelAnimationFrame(this._requestAnimationId);
        this._requestAnimationId = '';
        this._texture.dispose();
        this._scene.remove(this._mesh);
        this._renderer.domElement.remove();
        this._video.onloadeddata = function(){};

        if (cb) {
           cb();
        }
    }
};


ProjectionDome.vertexShader = `
    varying vec2 vUv; 
    void main()
    {
        vUv = uv;

        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0 );
        gl_Position = projectionMatrix * mvPosition;
    }
`;


ProjectionDome.fragmentShader2 = `
    uniform float iGlobalTime;
    uniform vec2 iResolution;
    uniform sampler2D iChannel0;
    uniform float ratio;

    varying vec2 vUv;  
    varying vec4 vColor;
    void main() {
        vec4 zerovec = vec4(0.,0.,0.,0.);
        vec2 uv = vUv;
        vec2 d_uv = uv;
        d_uv.x = (uv.x-0.5) * (ratio) + 0.5;
        vec4 tex1 = texture2D( iChannel0,  uv);
        vec4 tex2 = texture2D( iChannel0,  d_uv);

        gl_FragColor = tex2;
    }
`;

ProjectionDome.WebGLDetector = {

    canvas:                !! window.CanvasRenderingContext2D,
    webgl:                 ( function () { try { var canvas = document.createElement( 'canvas' ); return !! window.WebGLRenderingContext && ( canvas.getContext( 'webgl' ) || canvas.getContext( 'experimental-webgl' ) ); } catch( e ) { return false; } } )(),
    workers:               !! window.Worker,
    fileapi:               window.File && window.FileReader && window.FileList && window.Blob,
};


try {
    module.exports = ProjectionDome;
} catch(err) {
    console.warn(err);
}