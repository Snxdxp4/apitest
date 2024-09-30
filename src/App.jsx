import { useState } from "react";
import "./App.css";

function App() {
  const [leetusername, setLeetUsername] = useState("");
  const [githubusername, setGithubUsername] = useState("");
  const [loading, isLoading] = useState(false);
  const [error, setError] = useState(null);
  const [leetcodeData, setLeetcodeData] = useState([]);
  const [githubData, setGithubData] = useState([]);

  const apiurl = import.meta.env.VITE_API_URL;
  const proxyurl = import.meta.env.VITE_PROXY_URL;
  const token = import.meta.env.VITE_GITHUB_TOKEN;
  const github = import.meta.env.VITE_GITHUB_URL;

  const fetchGithubData = async () => {
    const query = `
      query($userName:String!) {
        user(login: $userName){
          contributionsCollection {
            contributionCalendar {
              totalContributions
              weeks {
                contributionDays {
                  contributionCount
                  date
                }
              }
            }
          }
        }
      }
        `;
    const variables = `
    {
      "userName": "${githubusername}"
    }
    `;

    const githubgraphql = {
      query,
      variables,
    };
    const githubrequestOptions = {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(githubgraphql),
    };
    try {
      isLoading(true);
      setError(null);
      const response = await fetch(
        "https://api.github.com/graphql",
        githubrequestOptions
      );
      const data = await response.json();
      console.log(data);
      setGithubData(data);
    } catch (error) {
      setError(error);
    } finally {
      isLoading(false);
    }
  };

  const fetchLeetCodeData = async () => {
    const leetHeaders = new Headers();
    leetHeaders.append("content-type", "application/json");

    const leetgraphql = JSON.stringify({
      query:
        "\n    query userSessionProgress($username: String!) {\n  allQuestionsCount {\n    difficulty\n    count\n  }\n  matchedUser(username: $username) {\n    submitStats {\n      acSubmissionNum {\n        difficulty\n        count\n        submissions\n      }\n      totalSubmissionNum {\n        difficulty\n        count\n        submissions\n      }\n    }\n  }\n}\n  ",
      variables: { username: `${leetusername}` },
    });
    const leetrequestOptions = {
      method: "POST",
      headers: leetHeaders,
      body: leetgraphql,
    };
    try {
      isLoading(true);
      setError(null);
      const response = await fetch(proxyurl + apiurl, leetrequestOptions);
      const data = await response.json();
      console.log(data);

      setLeetcodeData(leetarr);
    } catch (error) {
      setError(error);
    } finally {
      isLoading(false);
    }
  };

  const leetsumbitHandler = (e) => {
    e.preventDefault();
    fetchLeetCodeData();
  };
  const githubsumbitHandler = (e) => {
    e.preventDefault();
    fetchGithubData();
  };
  // console.log(leetcodeData[0].matchedUser.submitStats);
  // console.log(leetcodeData[0].allQuestionsCount
  // );
  return (
    <div>
      <h1>leet code api</h1>

      <div>
        <form onSubmit={leetsumbitHandler}>
          <label htmlFor="text">Leetcode UserName</label>
          <br />
          <input
            type="text"
            value={leetusername}
            onChange={(e) => setLeetUsername(e.target.value)}
          />
          <button type="submit">Fetch Data</button>
        </form>
        {loading && <div>Loading...</div>}
        {error && <div>Error: {error.message}</div>}
        {leetcodeData.length > 0 && (
          <div>
            <p>leetcode username:{leetusername}</p>
            <div className="flex">
              <p>Difficulty Levels: </p>
              {leetcodeData[0].allQuestionsCount.map((item, index) => {
                return (
                  <div key={index} className="levels">
                    <p> {item.difficulty}:</p>
                    <p> {item.count}</p>
                  </div>
                );
              })}
              <p>subMissions: </p>
              {/* {leetcodeData[1].matchedUser.submitStats.acSubmissionNum.map((item,index)=>{
                return(
                  <div key={index} className="levels">
                    <p> {item.difficulty}:</p>
                    <p> {item.count}</p>
                    <p> {item.submissions}</p>
                  </div>
                )
              })} */}
            </div>
            <div>{/* */}</div>
          </div>
        )}
        <form onSubmit={githubsumbitHandler}>
          <label htmlFor="text">Github UserName</label>
          <br />
          <input
            type="text"
            value={githubusername}
            onChange={(e) => setGithubUsername(e.target.value)}
          />
          <button type="submit">Fetch Data</button>
        </form>
        {githubData.length > 0 && (
          <div>
            <p>github userName:{githubusername}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
