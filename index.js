const uuid = require('uuid').v4;
const sp = require("@novadynamics/streamplot")
const EventEmitter=require("events").EventEmitter;
const request = require('request');

class Window extends EventEmitter
{
    constructor({address, port=80}, {plot_id=null, plot_title="Unnamed Plot", redraw_time_ms})
    {
        super();
        this.server_address = address;
        this.server_port = port;
        this.server_url = `http://${this.server_address}:${this.server_port}`;
        this.duty_cycle = redraw_time_ms || 100;
        this.id = plot_id || uuid();
        this.title = plot_title;
        this.fields = []
    }

    add_subplot(bbox, config)
    {
        let axis = new Axis(this,bbox,config);
        axis.class_name = axis.constructor.name
        this.fields.push(axis);

        axis.on("datastate_updated", (ds)=>this._datastate_updated(ds))
        return axis;
    }

    _datastate_updated(ds)
    {
        request.post({
            url: this.server_url + `/plot/${this.id}/datastate_update`,
            json: { datastate: ds },
            headers: { 'Content-Type': 'application/json' }
          }, (error, response, body) => {
            if (error) {
              console.error(error);
              return;
            }
          });
    }

    init()
    {
        request.post({
            url: this.server_url + `/add_plot_instance`,
            json: { plot_instance: this },
            headers: { 'Content-Type': 'application/json' }
          }, (error, response, body) => {
            if (error) {
              console.error(error);
              return;
            }
            console.log(body);
          });
    }

    start()
    {

    }
}
class Field extends EventEmitter
{
    constructor(window, bbox, config)
    {
        super();
        //this.window = window;
        this.bbox = bbox;
        this.config = config;

        this.elements = [];
    }

    add_element(element) {
        element.datastate.on("updated", ()=>this.emit("datastate_updated", element.datastate))

        element.class_name = element.constructor.name
        element.datastate.class_name = element.datastate.constructor.name

        this.elements.push(element);
        return element;
    }

    remove_element(element) {


        //TODO: Implement server communication

    }



    select_datastate_by_id(ds_id) {
        let el = this.elements.find((e)=>e.datastate.id==ds_id);

        if (el)
            return el.datastate
        else 
            return undefined
    }
}
class Axis  extends Field
{
    constructor(window, bbox, config)
    {
        super(window, bbox, config);
    }

     /**
     * Adds a line plot to the axis.
     * @param {Object} datastate - The data for the line plot.
     * @param {Object} config - The configuration options for the line plot.
     * @returns {Object} The line plot element.
     */
    plot(datastate, config) {
        
        let line = this.add_element(sp.Element.Line.plot(datastate, config));
        return line;
    }

    /**
     * Adds a matrix plot (heatmap) to the axis.
     * @param {Object} data_class - The data for the matrix plot.
     * @param {Object} config - The configuration options for the matrix plot.
     * @returns {Object} The matrix plot element.
     */
    imshow(data_class,config) {
        let matplot = this.add_element(sp.Element.Matrix.plot( data_class, config));
        return matplot;
    }
}


class Textbox extends Field
{
    constructor(window, bbox, config)
    {
        super(window, bbox, config);
    }

    static write(window,bbox,self_config, datastates) {
        let textbox = new this(window,bbox,self_config);
        datastates.forEach(({datastate, config={}}) => { textbox.add_element( sp.Element.Text.write_line(datastate, config) ) });
        return textbox;
    }
}

module.exports = exports = {
    Window : Window,
    Axis : Axis,
    Textbox : Textbox,
    Element : sp.Element,
    DataState : sp.DataState
};