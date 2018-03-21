'use strict';

import './style/main.scss';
import React from 'react';
import ReactDom from 'react-dom';
import superagent from 'superagent';

const API_URL= 'https://www.reddit.com/subreddits.json?limit=100';
const API_URL1 = 'http://reddit.com/r/';
const API_URL2 = '.json?limit=';

class RedditForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      formBoard: '',
      formLimit: '',
    };

    this.handlesearchFormBoardChange = this.handlesearchFormBoardChange.bind(this);
    this.handlesearchFormLimitChange = this.handlesearchFormLimitChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handlesearchFormBoardChange(e) {
    this.setState({ formBoard: e.target.value });
  }

  handlesearchFormLimitChange(e) {
    this.setState({ formLimit: e.target.value });
  }

  handleSubmit(e) {
    e.preventDefault();
    this.props.articleSelect(this.state.formBoard, this.state.formLimit);
  }

  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        {/* <input
          type='text'
          name='limit'
          value={this.state.formLimit}
          onChange={this.handlesearchFormLimitChange} />  */}
        <input
          type='text'
          name='board'
          value={this.state.formBoard}
          onChange={this.handlesearchFormBoardChange} />
      </form>
    );
  }
}

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      articleLookup: {},
      articleSelected: null,
      articleNameError: null,
    };

    this.articleSelect = this.articleSelect.bind(this);
  }

  componentDidUpdate() {
    console.log('__STATE__', this.state);
  }

  componentDidMount() {
    if(localStorage.articleLookup) {
      try {
        let articleLookup = JSON.parse(localStorage.articleLookup);
        this.setState({ articleLookup });
      }
      catch(err) {
        console.error(err);
      }
    } else {
      superagent.get(API_URL)
        .then( res => {
          console.log(res.body.data.children);
          let articleLookup = res.body.data.children.reduce((lookup, n) => {
            lookup[n.data.display_name]= `https://www.reddit.com/r/${n.data.display_name}.json?limit=100` ;
            return lookup;
          }, {});
          try {
            localStorage.articleLookup = JSON.stringify(articleLookup);
            this.setState({ articleLookup });  
          } catch(err) {
            console.error(err);
          }
        })
        .catch(console.error);
    }
  }

  articleSelect(board) {
    if(!this.state.articleLookup[board]) {
      console.log('1');
      this.setState({
        articleSelected: null,
        articleNameError: name,
      });
    } else {
      console.log('2');
      superagent.get(this.state.articleLookup[board])
        .then( res => {
          console.log('res: ', res.body);
          this.setState({
            articleSelected: res.body,
            articleNameError: null,
          });
          console.log(this.state.articleSelected);
        })
        .catch(console.error);
    }
  }

  render() {
    return (
      <section>
        <h1>Reddit Form</h1>
        <RedditForm articleSelect={this.articleSelect}/>

        { this.state.articleNameError ? 
          <div>
            <h2>Selected: {this.state.articleNameError} does not exist</h2>  
            <h3>Please make another request </h3>
          </div> :
          <div>
            { this.state.articleSelected ?
              <div>
                <h2> Selected: ${this.state.articleSelected.data.children[0].data.subreddit}</h2>
                <h3> Articles: </h3>
                <ul>
                  {this.state.articleSelected.data.children.map((item, i) => {
                    return (
                      <li key={i}>
                        <p><a href={`https://www.reddit.com${item.data.permalink}`} target='_blank'>{item.data.title}</a></p>
                        <p><a href={`https://www.reddit.com${item.data.permalink}`} target='_blank'>{item.data.ups}</a></p>
                      </li>
                    );
                  })}
                </ul>
              </div> :
              <div>
  
              </div>
            }
          </div>
        }
      </section>
    );
  }
}


const container = document.createElement('main');
document.body.appendChild(container);
ReactDom.render(<App />, document.getElementById('root'));