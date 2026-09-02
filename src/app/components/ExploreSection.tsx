/* eslint-disable @next/next/no-img-element */
import Link from "next/link";

export default function ExploreSection() {
  return (
    <section id="explore">
      <div className="explore-shell">
        <div className="exp-intro" data-reveal>
          <span className="exp-intro-lbl">Curated Collections</span>
          <h2 className="exp-intro-h">Explore our<br />curations</h2>
          <p className="exp-intro-p">
            Distinct ways to discover cinema — each a different lens on storytelling,
            craft, and the company you keep.
          </p>
        </div>

        <div className="exp-rows">
          {/* Watch With Someone */}
          <div className="exp-row exp-fwd" data-reveal="left">
            <div className="exp-img">
              <div className="r">
                <img src="https://apnmag.com/wp-content/uploads/2021/10/alin-surdu-j5gcqqm3eya-unsplash.jpg" alt="Watch together" />
              </div>
            </div>
            <div className="exp-tf">
              <span className="exp-num">01</span>
              <h3 className="exp-h">Watch With Someone</h3>
              <div className="exp-description">
                <p>Cinema changes when you share it. Films curated for every season and every kind of company.</p>
              </div>
              <Link href="/seasons" className="exp-explore-btn">
                Explore seasons <span>→</span>
              </Link>
            </div>
          </div>

          {/* Festival Season */}
          <div className="exp-row exp-rev" data-reveal="right">
            <div className="exp-tr">
              <span className="exp-num">02</span>
              <h3 className="exp-h">Festival Season</h3>
              <div className="exp-description">
                <p>Where cinema is being redefined. Winners and discoveries from Cannes, Berlin, and Venice.</p>
              </div>
              <Link href="/festival-season" className="exp-explore-btn exp-explore-btn-right">
                Explore festivals <span>→</span>
              </Link>
            </div>
            <div className="exp-img">
              <div className="r">
                <img src="https://media.cnn.com/api/v1/images/stellar/prod/gettyimages-476996143.jpg?c=16x9&q=w_800,c_fill" alt="Festival cinema" />
              </div>
            </div>
          </div>

          {/* Cinema by Experience */}
          <div className="exp-row exp-fwd" data-reveal="left">
            <div className="exp-img">
              <div className="r">
                <img src="https://i.etsystatic.com/60619267/r/il/c0ca47/7192898378/il_1588xN.7192898378_2v9n.jpg" alt="Cinematic craft" />
              </div>
            </div>
            <div className="exp-tf">
              <span className="exp-num">03</span>
              <h3 className="exp-h">Cinema by Experience</h3>
              <div className="exp-description">
                <p>Move beyond emotion. Explore films by visual craft, sound design, and the shape of a story.</p>
              </div>
              <Link href="/cinema-by-experience" className="exp-explore-btn">
                Explore craft <span>→</span>
              </Link>
            </div>
          </div>

          {/* Staff Picks */}
          <div className="exp-row exp-rev" data-reveal="right">
            <div className="exp-tr">
              <span className="exp-num">04</span>
              <h3 className="exp-h">Staff Picks</h3>
              <div className="exp-description">
                <p>The What2Watch team — with invited critics and filmmakers — share the films they return to.</p>
              </div>
              <Link href="/staff-picks" className="exp-explore-btn exp-explore-btn-right">
                Explore curators <span>→</span>
              </Link>
            </div>
            <div className="exp-img">
              <div className="r">
                <img src="https://i.pinimg.com/1200x/95/33/9e/95339e2896130b4a02d9d828b2740af9.jpg" alt="Curators" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
