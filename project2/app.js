// #region imports
import { buildProgramFromSources, loadShadersFromURLS, setupWebGL } from "../../libs/utils.js";
import { ortho, lookAt, flatten, mix, mult, inverse, vec4, perspective, rotateY, rotateZ } from "../../libs/MV.js";
import { modelView, loadMatrix, multRotationY, multRotationX, multRotationZ, multScale, pushMatrix, popMatrix, multTranslation } from "../../libs/stack.js";

import * as dat from '../../libs/dat.gui.module.js';

import * as SPHERE from '../../libs/objects/sphere.js';
import * as CUBE from '../../libs/objects/cube.js';
import * as CYLINDER from '../../libs/objects/cylinder.js';
// #endregion

// #region Constants
//! ------------------------------Constants------------------------------------

// #region camera related constants
const VP_DISTANCE = 70;

const DEFAULT_CAMERA_Y_OFFSET = VP_DISTANCE/4 ;

const IN_FRONT = [0, 0, VP_DISTANCE];
const TO_THE_RIGHT = [VP_DISTANCE, 0, 0];
const ON_TOP = [0, VP_DISTANCE, 0];

const ORIGIN = [0, 0, 0];

const DEFAULT_UP = [0, 1, 0];

const TOP_VIEW_UP = [-1, 0, 0];

const Cam_modes = {
    AXONOMETRIC: 1,
    FRONT: 2,
    RIGHT: 3,
    TOP: 4,
    FP: 5
}

const THETA_MIN = 0;
const THETA_MAX = 180;
const THETA_STEP = 0.5;
const INIT_THETA = 45;

const GAMMA_MIN = 0;
const GAMMA_MAX = 180;
const GAMMA_STEP = 0.5;
const INIT_GAMMA = 35;

const FOV_MIN = 30;
const FOV_MAX = 120;
const FOV_STEP = 1;
const DEFAULT_FOV = 60;
// #endregion

// #region ground related constants
const GROUND_EDGE = 120;
const GROUND_HEIGHT = 1;
const END_STONE_COLOUR = [184, 176, 155];
// #endregion

// #region helicopter related constants
const HELI_BASE_COLOUR = [140, 123, 22];
const HELI_ACCENT_COLOUR = [112, 242, 255];
const HELI_NEUTRAL_COLOUR = [90, 90, 90];

const FUSELAGE_HEIGHT = 1.7;
const FUSELAGE_LENGTH = 4.0;
const FUSELAGE_WIDTH = 1.8;

const MAIN_AXLE_LENGTH = 0.25;
const MAIN_AXLE_HEIGHT = 0.5;
const MAIN_AXLE_WIDTH = 0.25;
const MAIN_ROTOR_RPS = 3;

const MAIN_BLADE_LENGTH = 4;
const MAIN_BLADE_HEIGHT = 0.1;
const MAIN_BLADE_WIDTH = 0.5;
const MAIN_BLADE_ROTATION = -20;

const TAIL_Y_OFFSET = 0.25;

const BOOM_LENGTH = 5;
const BOOM_HEIGHT = 0.5;
const BOOM_WIDTH = 0.4;

const RUDDER_ANGLE = 60;
const RUDDER_LENGTH = 1.5;
const RUDDER_HEIGHT = 0.5;
const RUDDER_WIDTH = 0.4;

const TAIL_AXLE_LENGTH = 0.15;
const TAIL_AXLE_HEIGHT = 0.4;
const TAIL_AXLE_WIDTH = 0.15;
const TAIL_ROTOR_RPS = 4;

const TAIL_BLADE_LENGTH = 0.7;
const TAIL_BLADE_HEIGHT = 0.05;
const TAIL_BLADE_WIDTH = 0.25;

const LANDING_SKID_LENGTH = 0.2;
const LANDING_SKID_HEIGHT = 4;
const LANDING_SKID_WIDTH = 0.2;

const LANDING_GEAR_HEIGHT = 0.6;

const LANDING_SKID_Z_OFFSET = FUSELAGE_WIDTH/2;
const LANDING_SKID_Y_OFFSET = LANDING_GEAR_HEIGHT + FUSELAGE_HEIGHT/2 - LANDING_SKID_WIDTH/2;

const LEG_LENGTH = 0.1;
const LEG_HEIGHT = Math.sqrt(Math.pow(LANDING_SKID_Y_OFFSET, 2) + Math.pow(LANDING_SKID_Z_OFFSET, 2)) - LANDING_SKID_WIDTH / 2;
const LEG_WIDTH = 0.1;
const LEG_DISTANCE = 1.5;

const HELI_CLIPPING_THRESHOLD = LANDING_SKID_Y_OFFSET + LANDING_SKID_WIDTH/2;

const HELI_ORBIT = 30;
const MAX_ALTITUDE = 50;
const LANDING_ALTITUDE = 1;
const MAX_TILT_ANGLE = 30;
const MAX_VELOCITY = 45;   // 1/4 rps
const ACCELERATION = 30;     // 50 ms^-2
const TILT_ACCELERATION = 40;
const LIFT_SPEED = 5;

const FORWARD = -1;         // clock-wise
// #endregion

// #region end pillar related constants
const OBSIDIAN_COLOUR = [8, 7, 12];
const STONE_COLOUR = [82, 82, 82];
const CRYSTAL_OUTER_COLOUR = [189, 245, 255];
const CRYSTAL_CORE_COLOR = [201, 59, 217];

const OUTER_COLLUMN_LENGTH = 15;
const OBSIDIAN_COLLUMN_HEIGHT = 50;
const OUTER_COLLUMN_WIDTH = OUTER_COLLUMN_LENGTH/2;
const INNER_COLLUMN_EDGE = OUTER_COLLUMN_LENGTH * 4 / 5;

const PEDESTAL_BASE_EDGE = 3;
const PEDESTAL_BASE_HEIGHT = 0.6;
const PEDESTAL_HEIGHT = PEDESTAL_BASE_HEIGHT * 2;
const PEDESTAL_COLLUMN_EDGE = PEDESTAL_BASE_EDGE * 4 / 5;

const OUTER_CRYSTAL_EDGE = 3;
const MIDDLE_CRYSTAL_EDGE = OUTER_CRYSTAL_EDGE * 4 / 5;
const INNER_CRYSTAL_EDGE = MIDDLE_CRYSTAL_EDGE * 4 / 5;
const OUTER_CRYSTAL_RPS = 1 / 10;
const MIDDLE_CRYSTAL_RPS = 3/2 * OUTER_CRYSTAL_RPS;
const INNER_CRYSTAL_RPS = 3/2 * MIDDLE_CRYSTAL_RPS;

const PILLAR_OFFSET_RADIUS = GROUND_EDGE * 2 / 5;
const PILLAR_ROTATION = 60;
// #endregion

// #region end portal related constants
const PORTAL_SCREEN_COLOUR = [0, 0, 0];

const PORTAL_PILLAR_EDGE = 2;
const PORTAL_PILLAR_HEIGHT = 8;

const PORTAL_SCREEN_EDGE = 10;
const PORTAL_SCREEN_HEIGHT = 0.1;

const PORTAL_BORDER_EDGE_LENGTH = PORTAL_SCREEN_EDGE - 4;
const PORTAL_BORDER_HEIGHT = 2;
const PORTAL_BORDER_WIDTH = 2;

const PORTAL_BORDER_CORNER_LENGTH = 2;
// #endregion

// #region package related constants
const PACKAGE_LIFESPAN = 5;

const GRAVITY_ACCELERATION = 9.8;
const DRAG = -10;

const ORB_GREEN = [4, 252, 4];
const ORB_BLUE = [72, 232, 250];
const ORB_YELLOW = [204, 255, 0];

const ORB_RADIUS = 1;
// #endregion

// #region other constants
const gui = new dat.GUI();
// #endregion
// #endregion

// #region Variables
//! ------------------------------Variables------------------------------------

// #region application variables
/** @type {WebGLRenderingContext} */
let gl;

let canvas;
let aspect;

let effectController;
let fov_controller;

let mView;
let mProjection;

let program;

let time = 0;           // Global simulation time in seconds
let speed = 1/60.0;     // Speed of animation
let mode;               // Drawing mode (gl.LINES or gl.TRIANGLES)
// #endregion

// #region helicopter variables
let cam_mode = Cam_modes.AXONOMETRIC;
let camera_pos;
let camera_target = ORIGIN;
let up = DEFAULT_UP;

let isUp = false;       // Helicopter is in the air
let altitude = 0;       // Helicopter altitude relative to the world plane
let moving = false;
let angular_velocity = 0;       // Angular velocity
let pos = 0;            // Angular position (degrees)
let angle = 0;
let accelerating = false;

let ascending = false;
let descending = false;

let heliPos;
let heliTarget;
// #endregion

// #region other variables
/**
 *  Each element, or package, has the following set of properties
 * 
 *  @param  {number}    time_of_death       timestamp of when the package should vanish.
 *  @param  {number}    alpha               helicopter angle at spawn timestamp.
 *  @param  {array}     linear_velocity     package velocity at the moment.
 *  @param  {number}    vertical_velocity   package vertical velocity at the moment.
 *  @param  {number}    xPos                package x coordinate.
 *  @param  {number}    altitude            package altitude relative to the ground.
 *  @param  {number}    zPos                package z coordinate.
 */
let package_buffer = [];
const DRAGON_EGG_RADIUS = 2;
const DRAGON_EGG_HEIGHT = 2.5;
// #endregion
// #endregion

function setup(shaders) {

    // #region init
    canvas = document.getElementById("gl-canvas");
    aspect = canvas.width / canvas.height;

    gl = setupWebGL(canvas);

    program = buildProgramFromSources(gl, shaders["shader1.vert"], shaders["shader1.frag"]);
    
    mProjection = getOrthProj();

    mode = gl.LINES; 

    resize_canvas();
    window.addEventListener("resize", resize_canvas);

    gl.clearColor(27/255, 3/255, 28/255, 1.0);
    SPHERE.init(gl);
    CUBE.init(gl);
    CYLINDER.init(gl);
    gl.enable(gl.DEPTH_TEST);   // Enables Z-buffer depth test

    document.onkeydown = function(event) {
        switch(event.key) {
            case 'w':
                mode = gl.LINES; 
                break;
            case 's':
                mode = gl.TRIANGLES;
                break;
            case 'ArrowLeft':
                accelerating = isUp;
                break;
            case 'ArrowUp':
                ascending = altitude < MAX_ALTITUDE;
                break;
            case 'ArrowDown':
                descending = isUp;
                break;
            case '1':
                cam_mode = Cam_modes.AXONOMETRIC;
                camera_target = ORIGIN;
                up = DEFAULT_UP;
                break;
            case '2':
                cam_mode = Cam_modes.FRONT
                camera_pos = IN_FRONT;
                camera_target = ORIGIN;
                up = DEFAULT_UP;
                break;
            case '3':
                cam_mode = Cam_modes.RIGHT;
                camera_pos = ON_TOP;
                camera_target = ORIGIN;
                up = TOP_VIEW_UP;
                break;
            case '4':
                cam_mode = Cam_modes.TOP;
                camera_pos = TO_THE_RIGHT;
                camera_target = ORIGIN;
                up = DEFAULT_UP;
                break;
            case '5':
                cam_mode = Cam_modes.FP;
                break;
            case ' ':
                if (altitude > 0)
                    loadOrb();
                break;
        }
    }

    document.onkeyup = function(event) {
        switch(event.key) {
            case 'ArrowLeft':  
                accelerating = false;
                break;
            case 'ArrowUp':
                ascending = false;
                break;
            case 'ArrowDown':
                descending = false;
                break;
        }
    }
    
    window.requestAnimationFrame(render);

    function resize_canvas(event) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        aspect = canvas.width / canvas.height;

        gl.viewport(0,0,canvas.width, canvas.height);
        mProjection = ortho(-VP_DISTANCE*aspect,VP_DISTANCE*aspect, -VP_DISTANCE, VP_DISTANCE,-3*VP_DISTANCE,3*VP_DISTANCE);
    }

    function init_axo_cam_controller() {

        effectController = {
            theta: INIT_THETA,
            gamma: INIT_GAMMA
          };

        let folder;
        folder = gui.addFolder('Axonometric controller');

        folder.add(effectController, 'theta', THETA_MIN, THETA_MAX, THETA_STEP);

        folder.add(effectController, 'gamma', GAMMA_MIN, GAMMA_MAX, GAMMA_STEP);

    }

    function init_fov_controller() {

        fov_controller = {
            angle: DEFAULT_FOV
        }

        let folder;
        folder = gui.addFolder('FOV controller');

        folder.add(fov_controller, 'angle', FOV_MIN, FOV_MAX, FOV_STEP);

    }

    init_axo_cam_controller();
    init_fov_controller()
    // #endregion

    //! ---------------------------Helper Functions----------------------------

    function uploadModelView(prog) {
        gl.useProgram(prog);
        gl.uniformMatrix4fv(gl.getUniformLocation(prog, "mModelView"), false, flatten(modelView()));
    }

    function uploadProjection(prog) {
        gl.useProgram(prog);
        gl.uniformMatrix4fv(gl.getUniformLocation(prog, "mProjection"), false, flatten(mProjection));
    }

    function setColour(prog, rgb) {
        let colour = rgb.map(function(x) {return x/255;});
        gl.useProgram(prog);
        gl.uniform3f(gl.getUniformLocation(prog, "color"), colour[0], colour[1], colour[2]);
    }

    function getOrthProj() {
        return ortho(-VP_DISTANCE*aspect,VP_DISTANCE*aspect, -VP_DISTANCE, VP_DISTANCE,-3*VP_DISTANCE,3*VP_DISTANCE);
    }

    function getPerspProj() {
        let default_perspective = perspective(fov_controller.angle, aspect, 4.5, VP_DISTANCE * 2);
        let first_person = mult(default_perspective, rotateY(90));
        return mult(first_person, rotateZ(angle));
    }

    function updateProjection() {
        if (cam_mode == Cam_modes.FP)
            mProjection = getPerspProj();
        else
            mProjection = getOrthProj();
    }

    function loadOrb() {
        let time_of_death = time + PACKAGE_LIFESPAN;
        let linear_velocity = angular_velocity * HELI_ORBIT * speed;
        let alpha = (pos) * Math.PI/180;

        let orb_values = {
            time_of_death: time_of_death,
            alpha: alpha,
            linear_velocity: linear_velocity,
            vertical_velocity: 0,
            xPos: heliPos[0],
            altitude: altitude,
            zPos: heliPos[2]
        };

        package_buffer.push(orb_values);
    }

    //! ------------------------Primitive Functions----------------------------

    // ground

    function ground() {

        multScale([GROUND_EDGE, GROUND_HEIGHT, GROUND_EDGE]);

        uploadModelView(program);

        setColour(program, END_STONE_COLOUR);

        CUBE.draw(gl, program, mode);
    }

    // #region end pillar
    function obsidian_outer_collumn_module() {

        multScale([OUTER_COLLUMN_LENGTH, OBSIDIAN_COLLUMN_HEIGHT, OUTER_COLLUMN_WIDTH]);

        uploadModelView(program);

        setColour(program, OBSIDIAN_COLOUR);

        CUBE.draw(gl, program, mode);

    }

    function obsidian_inner_collumn_module() {

        multScale([INNER_COLLUMN_EDGE, OBSIDIAN_COLLUMN_HEIGHT, INNER_COLLUMN_EDGE]);

        uploadModelView(program);

        setColour(program, OBSIDIAN_COLOUR);

        CUBE.draw(gl, program, mode);

    }

    function pedestal_base() {

        multScale([PEDESTAL_BASE_EDGE, PEDESTAL_BASE_HEIGHT, PEDESTAL_BASE_EDGE]);

        uploadModelView(program);

        setColour(program, STONE_COLOUR);

        CUBE.draw(gl, program, mode);

    }

    function pedestal_collumn() {

        multScale([PEDESTAL_COLLUMN_EDGE, PEDESTAL_HEIGHT, PEDESTAL_COLLUMN_EDGE]);

        uploadModelView(program);

        setColour(program, STONE_COLOUR);

        CUBE.draw(gl, program, mode);

    }

    function outer_crystal_module() {

        multScale([OUTER_CRYSTAL_EDGE, OUTER_CRYSTAL_EDGE, OUTER_CRYSTAL_EDGE]);

        uploadModelView(program);

        setColour(program, CRYSTAL_OUTER_COLOUR);

        CUBE.draw(gl, program, gl.LINES);

    }

    function middle_crystal_module() {

        multScale([MIDDLE_CRYSTAL_EDGE, MIDDLE_CRYSTAL_EDGE, MIDDLE_CRYSTAL_EDGE]);

        uploadModelView(program);

        setColour(program, CRYSTAL_OUTER_COLOUR);

        CUBE.draw(gl, program, gl.LINES);

    }

    function inner_crystal_module() {

        multScale([INNER_CRYSTAL_EDGE, INNER_CRYSTAL_EDGE, INNER_CRYSTAL_EDGE]);

        uploadModelView(program);

        setColour(program, CRYSTAL_CORE_COLOR);

        CUBE.draw(gl, program, mode);

    }
    // #endregion

    // #region end portal
    function portal_edge() {
        
        multScale([PORTAL_BORDER_EDGE_LENGTH, PORTAL_BORDER_HEIGHT, PORTAL_BORDER_WIDTH]);

        uploadModelView(program);

        setColour(program, STONE_COLOUR);

        CUBE.draw(gl, program, mode);

    }

    function portal_corner() {
        
        multScale([PORTAL_BORDER_CORNER_LENGTH, PORTAL_BORDER_HEIGHT, PORTAL_BORDER_WIDTH]);

        uploadModelView(program);

        setColour(program, STONE_COLOUR);

        CUBE.draw(gl, program, mode);

    }

    function portal_pillar() {

        multScale([PORTAL_PILLAR_EDGE, PORTAL_PILLAR_HEIGHT, PORTAL_PILLAR_EDGE]);

        uploadModelView(program);

        setColour(program, STONE_COLOUR);

        CUBE.draw(gl, program, mode);

    }

    function portal_screen() {
        
        multScale([PORTAL_SCREEN_EDGE, PORTAL_SCREEN_HEIGHT, PORTAL_SCREEN_EDGE]);

        uploadModelView(program);

        setColour(program, PORTAL_SCREEN_COLOUR);

        CUBE.draw(gl, program, mode);

    }

    function dragon_egg() {

        multScale([DRAGON_EGG_RADIUS, DRAGON_EGG_HEIGHT, DRAGON_EGG_RADIUS]);

        uploadModelView(program);

        setColour(program, OBSIDIAN_COLOUR);

        SPHERE.draw(gl, program, mode);

    }
    // #endregion

    // #region package - exp orb
    function orb() {

        multScale([ORB_RADIUS, ORB_RADIUS, ORB_RADIUS]);

        uploadModelView(program);
        
        setColour(program, mix( mix(ORB_GREEN, ORB_BLUE, (1 + Math.sin(time * 5))), ORB_YELLOW, (1 + Math.sin(time * 10 ))));

        SPHERE.draw(gl, program, mode)

    }
    // #endregion

    // #region helicopter
    function heli_fuselage() {

        multScale([FUSELAGE_LENGTH, FUSELAGE_HEIGHT, FUSELAGE_WIDTH]);

        uploadModelView(program);
        
        setColour(program, HELI_BASE_COLOUR);

        SPHERE.draw(gl, program, mode);

    }

    function heli_tail_boom() {

        multScale([BOOM_LENGTH, BOOM_HEIGHT, BOOM_WIDTH]);

        uploadModelView(program);
        
        setColour(program, HELI_BASE_COLOUR);

        SPHERE.draw(gl, program, mode);
        
    }

    function heli_rudder() {

        multScale([RUDDER_LENGTH, RUDDER_HEIGHT, RUDDER_WIDTH])
        
        uploadModelView(program);

        SPHERE.draw(gl, program, mode);

    }

    function heli_main_axle() {

        multScale([MAIN_AXLE_LENGTH, MAIN_AXLE_HEIGHT, MAIN_AXLE_WIDTH]);

        uploadModelView(program);
        
        setColour(program, HELI_NEUTRAL_COLOUR);

        CYLINDER.draw(gl, program, mode);

    }

    function heli_tail_axle() {

        multScale([TAIL_AXLE_LENGTH, TAIL_AXLE_HEIGHT, TAIL_AXLE_WIDTH]);

        uploadModelView(program);
        
        setColour(program, HELI_NEUTRAL_COLOUR);

        CYLINDER.draw(gl, program, mode);

    }

    function heli_main_blade() {

        multTranslation([MAIN_BLADE_LENGTH/2, 0, 0]);
        
        multRotationX(MAIN_BLADE_ROTATION);

        multScale([MAIN_BLADE_LENGTH, MAIN_BLADE_HEIGHT, MAIN_BLADE_WIDTH])

        uploadModelView(program);

        setColour(program, HELI_ACCENT_COLOUR);

        SPHERE.draw(gl, program, mode);

    }

    function heli_tail_blade() {

        multTranslation([TAIL_BLADE_LENGTH/2, 0, 0]);
        
        multRotationX(10);

        multScale([TAIL_BLADE_LENGTH, TAIL_BLADE_HEIGHT, TAIL_BLADE_WIDTH]);

        uploadModelView(program);

        setColour(program, HELI_ACCENT_COLOUR);

        SPHERE.draw(gl, program, mode);

    }

    function heli_leg() {

        multRotationX((-Math.atan(LANDING_SKID_Z_OFFSET/LANDING_SKID_Y_OFFSET))*180/Math.PI);

        multTranslation([0, LANDING_SKID_Y_OFFSET/2 + LANDING_SKID_WIDTH/2, 0]);

        multScale([LEG_LENGTH, LEG_HEIGHT, LEG_WIDTH]);

        uploadModelView(program);

        setColour(program, HELI_NEUTRAL_COLOUR);

        CYLINDER.draw(gl, program, mode);

    }
    
    function heli_landing_skid() {

        multRotationZ(90);

        multScale([LANDING_SKID_LENGTH, LANDING_SKID_HEIGHT, LANDING_SKID_WIDTH]);

        uploadModelView(program);
        
        setColour(program, HELI_BASE_COLOUR);

        CYLINDER.draw(gl, program, mode);

    }
    // #endregion

    //! ---------------------------Matrix Functions----------------------------

    // #region end pillar
    function obsidian_collumn() {

        pushMatrix();
            obsidian_outer_collumn_module();
        popMatrix();
        pushMatrix();
            multRotationY(90);
            obsidian_outer_collumn_module();
        popMatrix();
        pushMatrix();
            obsidian_inner_collumn_module();
        popMatrix();

    }

    function nether_star() {

        pushMatrix();
            multRotationY(OUTER_CRYSTAL_RPS*360*time);
            multRotationX(35);
            multRotationZ(45);
            outer_crystal_module();
        popMatrix()

        pushMatrix();
            multRotationX(MIDDLE_CRYSTAL_RPS*360*time);
            multRotationY(MIDDLE_CRYSTAL_RPS*360*time);
            multRotationZ(MIDDLE_CRYSTAL_RPS*360*time);
            middle_crystal_module();
        popMatrix();

        pushMatrix();
            multRotationX(INNER_CRYSTAL_RPS*360*time);
            multRotationY(INNER_CRYSTAL_RPS*360*time);
            multRotationZ(INNER_CRYSTAL_RPS*360*time);
            inner_crystal_module();
        popMatrix();

    }

    function end_crystal() {
        
        pushMatrix();
            pedestal_base();
        popMatrix();

        pushMatrix();
            multTranslation([0, PEDESTAL_BASE_HEIGHT/2, 0])
            pedestal_collumn();
        popMatrix();

        pushMatrix();
            multTranslation([0, PEDESTAL_HEIGHT * (3 + Math.cos(time))/2 + Math.sqrt(3)*OUTER_CRYSTAL_EDGE/2, 0]);
            nether_star()
        popMatrix();

    }

    function end_pillar() {

        pushMatrix();
            obsidian_collumn();
        popMatrix();
        pushMatrix();
            multTranslation([0, OBSIDIAN_COLLUMN_HEIGHT/2 + PEDESTAL_BASE_HEIGHT/2, 0]);
            end_crystal();
        popMatrix();

    }

    function pillar_set() {
        
        pushMatrix();
            multTranslation([PILLAR_OFFSET_RADIUS, 0, 0]);
            end_pillar();
        popMatrix();

        multRotationY(PILLAR_ROTATION);
        pushMatrix();
            multTranslation([PILLAR_OFFSET_RADIUS, 0, 0]);
            multRotationY(-PILLAR_ROTATION);
            end_pillar();
        popMatrix();

        multRotationY(PILLAR_ROTATION);
        pushMatrix();
            multTranslation([PILLAR_OFFSET_RADIUS, 0, 0]);
            multRotationY(PILLAR_ROTATION);
            end_pillar();
        popMatrix();

        multRotationY(60);
        pushMatrix();
            multTranslation([PILLAR_OFFSET_RADIUS, 0, 0]);
            end_pillar();
        popMatrix();

        multRotationY(60);
        pushMatrix();
            multTranslation([PILLAR_OFFSET_RADIUS, 0, 0]);
            multRotationY(-PILLAR_ROTATION);
            end_pillar();
        popMatrix();

        multRotationY(60);
        pushMatrix();
            multTranslation([PILLAR_OFFSET_RADIUS, 0, 0]);
            multRotationY(PILLAR_ROTATION);
            end_pillar();
        popMatrix();
    }
    // #endregion

    // #region end portal
    function portal_border_module() {

        multTranslation([0, 0, PORTAL_SCREEN_EDGE/2 + PORTAL_BORDER_WIDTH/2]);
        pushMatrix();
            pushMatrix();
                portal_edge();
            popMatrix();

            pushMatrix();
                multTranslation([PORTAL_BORDER_EDGE_LENGTH/2 + PORTAL_BORDER_CORNER_LENGTH/2, 0, -PORTAL_BORDER_WIDTH]);
                portal_corner();
            popMatrix();
        popMatrix();

    }

    function portal_border() {

            pushMatrix();
                portal_border_module();
            popMatrix();
            
            multRotationY(90);
            pushMatrix();
                portal_border_module();
            popMatrix();
            
            multRotationY(90);
            pushMatrix();
                portal_border_module();
            popMatrix();
            
            multRotationY(90);
            pushMatrix();
                portal_border_module();
            popMatrix();

    }

    function end_portal() {

        pushMatrix();
            multTranslation([0, PORTAL_PILLAR_HEIGHT/2, 0]);
            portal_pillar();
        popMatrix();
        
        pushMatrix();
            portal_screen();
        popMatrix();
        
        pushMatrix();
            portal_border();
        popMatrix();
        
        pushMatrix();
            multTranslation([0, PORTAL_PILLAR_HEIGHT + DRAGON_EGG_HEIGHT/2, 0]);
            dragon_egg();
        popMatrix();
        
    }
    // #endregion
    
    // #region packages
    function orbs() {
        for (const p of package_buffer) {
            if (time < p.time_of_death) {
                pushMatrix();
                    multTranslation([p.xPos, p.altitude, p.zPos]);
                    orb();
                popMatrix();
            }
        }
    }
    // #endregion

    // #region helicopter
    function main_rotor() {

            pushMatrix();
                heli_main_axle();
            popMatrix();

            pushMatrix();
                // multRotationY(0);
                heli_main_blade();
            popMatrix();

            pushMatrix();
                multRotationY(120);
                heli_main_blade();
            popMatrix();

            pushMatrix();
                multRotationY(-120);
                heli_main_blade();
            popMatrix();

    }

    function tailRotor() {
        
        if (isUp)
            multRotationY(TAIL_ROTOR_RPS*-360*time); // 4 rps positive direction
        pushMatrix();
            heli_tail_axle();
        popMatrix();

        pushMatrix();
            multTranslation([0, TAIL_AXLE_HEIGHT/4, 0]);
            pushMatrix();
                // multRotationY(0);
                heli_tail_blade();
            popMatrix();

            pushMatrix();
                multRotationY(180);
                heli_tail_blade();
            popMatrix();
        popMatrix();

    }

    function rudder() {
        
        pushMatrix();
            heli_rudder();
        popMatrix();

        pushMatrix();
            multTranslation([0, 0, TAIL_AXLE_HEIGHT-RUDDER_WIDTH/2]);
            multRotationX(90);
            tailRotor();
        popMatrix();

    }

    function tail() {
        
        pushMatrix();
            heli_tail_boom();
        popMatrix();

        pushMatrix();
            multTranslation([BOOM_LENGTH/2, 0.2, 0]);
            multRotationZ(RUDDER_ANGLE);
            rudder();
        popMatrix();

    }

    function complete_skid() {

        multTranslation([0, 0, LANDING_SKID_Z_OFFSET])
        pushMatrix();
            heli_landing_skid();
        popMatrix();
        pushMatrix();
            multTranslation([-LEG_DISTANCE/2, 0, 0])
            heli_leg();
        popMatrix();
        pushMatrix();
            multTranslation([LEG_DISTANCE/2, 0, 0])
            heli_leg();
        popMatrix();

    }

    function landing_gear() {
                        
        pushMatrix();
            complete_skid();
        popMatrix();

        pushMatrix();
            multRotationY(180);
            complete_skid();
        popMatrix();

    }

    function helicopter() {

        pushMatrix();
            pushMatrix();
                heli_fuselage();
                const model = mult(inverse(mView), modelView());
                heliPos = mult(model, vec4(0,0,0,1));
                heliTarget = mult(model, vec4(0,0,2,1));
                heliPos.pop();
                heliTarget.pop();
            popMatrix();

            pushMatrix();
                multTranslation([0, FUSELAGE_HEIGHT/2 + MAIN_AXLE_HEIGHT*2/5, 0]);
                if (isUp)
                    multRotationY(MAIN_ROTOR_RPS*-360*time); // 3 rps positive direction
                main_rotor();
            popMatrix();

            pushMatrix();
                multTranslation([FUSELAGE_LENGTH/2 + BOOM_LENGTH/5, TAIL_Y_OFFSET, 0]);
                tail();
            popMatrix();

            pushMatrix();
                multTranslation([0, -LANDING_SKID_Y_OFFSET, 0]);
                landing_gear();
            popMatrix();
        popMatrix();

    }
    // #endregion

    function assemble() {

        multTranslation([0, -DEFAULT_CAMERA_Y_OFFSET, 0]);

        pushMatrix();
            ground();
        popMatrix();

        multTranslation([0, GROUND_HEIGHT/2, 0]);

        pushMatrix();
            if (pos % 360 != 0)
                multRotationY(pos);
            multTranslation([HELI_ORBIT, altitude + HELI_CLIPPING_THRESHOLD, 0]);
            if (angle > 0)
                multRotationX(angle);
            multRotationY(90);
            helicopter();
        popMatrix();

        pushMatrix();
            multTranslation([0, OBSIDIAN_COLLUMN_HEIGHT/2, 0]);
            pillar_set();
        popMatrix();

        pushMatrix();
            multTranslation([0, PORTAL_BORDER_HEIGHT/2, 0]);
            end_portal();
        popMatrix();

        pushMatrix();
            orbs();
        popMatrix();
    }

    //! -----------------------------Animation---------------------------------

    function updateHeliValues() {
        let atLandingAltitude = Math.round(altitude) <= LANDING_ALTITUDE;

        isUp = altitude > 0;

        moving = angular_velocity > 0;

        altitude += (isUp ? (descending && !atLandingAltitude || (descending && atLandingAltitude && !moving) ? -1 : (ascending && altitude < MAX_ALTITUDE ? 1 : 0)) : (descending ? 0 : (ascending ? 1 : 0))) * LIFT_SPEED * speed;

        if (isUp && accelerating && angular_velocity < MAX_VELOCITY)
            angular_velocity += ACCELERATION * speed;
        else if (isUp && !accelerating && angular_velocity > 0)
            angular_velocity -= ACCELERATION/2 * speed;

        if (isUp && accelerating && angle < MAX_TILT_ANGLE)
            angle += TILT_ACCELERATION * speed;
        else if (isUp && !accelerating && angle > 0)
            angle -= TILT_ACCELERATION * speed;

        pos += FORWARD * angular_velocity * speed;
    }

    function updatePackages() {        

        for (let i = 0; i < package_buffer.length; i++) {
            if (time >= package_buffer[i].time_of_death)
                package_buffer.splice(i, 1);
            else {
                const p = package_buffer[i];
                p.linear_velocity += p.linear_velocity > 0 ? DRAG * speed : 0;
                p.vertical_velocity += GRAVITY_ACCELERATION * speed;
                p.altitude -= p.altitude > ORB_RADIUS/2 + GROUND_HEIGHT/2 ? p.vertical_velocity * speed : 0;
                p.xPos += Math.sin(p.alpha) * p.linear_velocity * speed;
                p.zPos += Math.cos(p.alpha) * p.linear_velocity * speed;
            }

        }

    }

    function getAxonometricCamPos() {
        return [    VP_DISTANCE * Math.sin(effectController.theta * Math.PI/180),
                    VP_DISTANCE * Math.sin(effectController.gamma * Math.PI/180),
                    VP_DISTANCE * Math.cos(effectController.theta * Math.PI/180) * -Math.cos(effectController.gamma * Math.PI/180)  ];
    }

    function render() {

        time += speed;

        if (cam_mode == Cam_modes.AXONOMETRIC)
            camera_pos = getAxonometricCamPos();
        else if (cam_mode == Cam_modes.FP) {
            camera_pos = heliPos;
            camera_target = heliTarget;
            up = DEFAULT_UP;
        }

        mView = lookAt(camera_pos, camera_target, up)

        updateHeliValues();

        updatePackages();

        window.requestAnimationFrame(render);

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        updateProjection();

        uploadProjection(program);

        loadMatrix(mView);

        assemble();

    }
}

// #region shader urls
const urls = ["shader1.vert", "shader1.frag"];
loadShadersFromURLS(urls).then(shaders => setup(shaders))
// #endregion