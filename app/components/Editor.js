import React, { Component, PropTypes } from 'react';
import CodeMirror from 'codemirror';
import ReactCodeMirror from 'react-codemirror';

import { HOSTS_MATHER } from '../constants';

CodeMirror.defineMode('hosts', function () {
    return {
        token: function (stream) {
            const c = stream.peek();
            let token_name;
            if (c === '#') {
                token_name = 'comment';
                stream.skipToEnd();
            } else if (!stream.string.match(HOSTS_MATHER)) {
                token_name = 'error';
                stream.skipToEnd();
            } else {
                if (!stream.skipTo('#')) {
                    token_name = stream.skipToEnd();
                }
            }
            return token_name;
        },
        lineComment: '#'
    };
});

const codemirrorOptions = {
    mode: 'hosts',
    lineNumbers: true,
};

class Editor extends Component {
    constructor(props) {
        super(props);
        this.codemirrorOptions = codemirrorOptions;
        this.state = {
            value: props.value
        };
    }

    componentWillReceiveProps (props) {
        this.setState({ value: props.value });
        this.codemirrorOptions = Object.assign({}, codemirrorOptions, {
            readOnly: props.readOnly
        });
    }

    componentWillUnmount () {
        const { uid, onTextShouldUpdate } = this.props;
        onTextShouldUpdate && onTextShouldUpdate(uid, this.state.value);
    }

    __onChange (value) {
        this.setState({ value });
    }

    __onFocusChange (focused) {
        if (!focused) {
            const { value } = this.state;
            const { uid, onTextShouldUpdate } = this.props;
            onTextShouldUpdate && onTextShouldUpdate(uid, value);
        }
    }

    render() {
        return (<div>
                    <ReactCodeMirror
                        ref="codemirror"
                        value={ this.state.value }
                        options={ this.codemirrorOptions }
                        onChange={ this.__onChange.bind(this) }
                        onFocusChange={ this.__onFocusChange.bind(this) }  />
                </div>);
    }
}

Editor.propTypes = {
    uid: PropTypes.string,
    value: PropTypes.string,
    readOnly: PropTypes.bool,
    onTextShouldUpdate: PropTypes.func,
}

export default Editor;
