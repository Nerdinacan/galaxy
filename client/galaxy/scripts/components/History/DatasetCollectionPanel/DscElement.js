/**
 * This dumb wrapper exists purely to twist the needlessly-inconsistent
 * DatasetCollection api results into something that we can use in the existing
 * ContentItem components.
 */

// const _children = new WeakMap();
// const _elementProps = new WeakMap();

export default class DscElement {
    constructor(props) {
        Object.assign(this, props);
    }
}

// export default class DscElement {

//     constructor(history_id, element) {

//         // will need this later
//         this.history_id = history_id;

//         // Store children
//         const children = (element.object.element_count)
//             ? Array.from(element.object.elements)
//             : [];
//         _children.set(this, children);

//         // store raw values
//         const rawProps = JSON.parse(JSON.stringify(element));
//         if (rawProps.object.elements) {
//             delete rawProps.object.elements;
//         }

//         // clean up
//         rawProps.isDeleted = rawProps.deleted;
//         delete rawProps.deleted;

//         Object.assign(this, rawProps.object);

//         // store the top-level props on weakmap
//         const elementProps = Object.assign({}, rawProps);
//         delete elementProps.object;
//         _elementProps.set(this, elementProps);
//     }

//     get children() {
//         return _children.get(this).map(child => new DscElement(this.history_id, child));
//     }

//     get elProps() {
//         return _elementProps.get(this);
//     }

//     updateElProps(key, val) {
//         const newProps = Object.assign({}, this.elProps, {
//             [key]: val
//         })
//         _elementProps.set(this, newProps)
//     }



//     get history_content_type() {
//         return this.elProps.element_type;
//     }

//     set history_content_type(val) {
//         this.updateElProps("history_content_type", val);
//     }

//     get name() {
//         return this.elProps.element_identifier;
//     }

//     set name(val) {
//         this.updateElProps("name", val);
//     }

//     get type_id() {
//         return `${this.history_content_type}-${this.id}`;
//     }

//     set type_id(val) {
//         this.updateElProps("type_id", val);
//     }

//     get title() {
//         return this.name;
//     }
// }
